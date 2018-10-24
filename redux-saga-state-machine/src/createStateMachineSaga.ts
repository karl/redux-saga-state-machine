import * as redux from 'redux';
import * as reduxSaga from 'redux-saga';
import { fork, put, take } from 'redux-saga/effects';
import { Machine, State } from 'xstate';
import * as xstateTypes from 'xstate/lib/types';
import { toXstateConfig } from './toXstateConfig';
import {
  Action,
  Activity,
  GetState,
  MachineDescription,
  SagaFunction,
} from './types';

// tslint:disable-next-line:no-empty
const noop = () => {};

export const INIT = 'REDUX_SAGA_STATE_MACHINE/INIT';

type Options = {
  emit?: (obj: Record<string, any>) => void;
};

/** type guard for xstate Action interface */
const isActionObject = (action: xstateTypes.Action): action is xstateTypes.ActionObject => {
  return (<xstateTypes.ActionObject>action).type !== undefined;
}

export const createStateMachineSaga = (
  description: MachineDescription,
  { emit = noop }: Options = {},
): SagaFunction => {
  const logger = (obj: Record<string, any>) => {
    emit({
      ...obj,
      key: description.key,
    });

    if (description.debug) {
      const { type, label, ...details } = obj;
      // tslint:disable-next-line:no-console
      console.log(description.key + ': ' + label, details);
    }
  };

  return function*({
    getState,
    dispatch,
  }: {
    getState: GetState;
    dispatch: redux.Dispatch;
  }): reduxSaga.SagaIterator {
    const activities: Record<string, reduxSaga.Task> = {};

    const { setState } = description;
    const { xstateConfig, actionsMap } = toXstateConfig(description);

    const runActions = function*(result: State, event: redux.Action) {
      for (const action of result.actions) {
        if (isActionObject(action)){
          if (action.type === 'xstate.start') {
            const actionFunc = actionsMap[action.data.type] as Activity;
            logger({
              type: 'STATE_MACHINE_START_ACTIVITY',
              label: `Start activity ${action.data.type}`,
              action,
              state,
            });
            activities[action.data.type] = yield fork(actionFunc, event);
          } else if (action.type === 'xstate.stop') {
            logger({
              type: 'STATE_MACHINE_STOP_ACTIVITY',
              label: `Stop activity ${action.data.type}`,
              action,
              state,
            });
            activities[action.data.type].cancel();
          }        
        } else {
          const actionFunc = actionsMap[
            action as xstateTypes.ActionType
          ] as Action;
          logger({
            type: 'STATE_MACHINE_ACTION',
            label: `Action ${action}`,
            action,
            state,
            event,
          });
          actionFunc({ getState, dispatch }, event);
        }
      }
    };

    const machine = Machine(xstateConfig);

    logger({
      type: 'STATE_MACHINE_START',
      label: `Starting ${description.key}`,
      description,
      xstateConfig,
      actionsMap,
    });

    const initial = machine.initialState;
    let state = initial.value;
    logger({
      type: 'STATE_MACHINE_INITIAL_STATE',
      label: `Initial state ${state}`,
      state,
      initial,
    });
    yield put(setState(state));
    yield* runActions(initial, { type: INIT });

    while (true) {
      const stateNodes = machine.getStateNodes(state);
      const events = stateNodes[0].events;

      logger({
        type: 'STATE_MACHINE_LISTENING',
        label: `Listening for events ${events.join(', ')}`,
        state,
        events,
      });
      const event = yield take(events);
      logger({
        type: 'STATE_MACHINE_RECEIVED',
        label: `Received event ${event.type}`,
        event,
        state,
      });

      const result = machine.transition(state, event, { getState });
      if (result.value === state) {
        logger({
          type: 'STATE_MACHINE_NO_TRANSITION',
          label: `No transition`,
          result,
        });
      } else {
        state = result.value;
        logger({
          type: 'STATE_MACHINE_NEW_STATE',
          label: `State ${state}`,
          state,
          result,
        });
        yield put(setState(state));
      }

      yield* runActions(result, event);
    }
  };
};
