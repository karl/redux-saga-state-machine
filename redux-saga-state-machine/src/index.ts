import { SagaIterator } from 'redux-saga';
import { fork, put, take } from 'redux-saga/effects';
import { Machine } from 'xstate';

type ActionCreator = (
  state: any,
) => {
  type: string;
};

interface IMachineDescription {
  key: string;
  debug?: boolean;
  setState: ActionCreator;
  selectState: (state: any) => string;
  states: any;
}

// tslint:disable-next-line:no-empty
const noop = () => {};

export const createStateMachineSaga = (
  description: IMachineDescription,
  { emit = noop }: any = {},
) => {
  const logger = (obj: any) => {
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
    getState: any;
    dispatch: any;
  }): SagaIterator {
    const activities: any[] = [];

    const runActions = function*(result: any, event: any) {
      for (const action of result.actions as any[]) {
        if (action.type === 'xstate.start') {
          logger({
            type: 'STATE_MACHINE_START_ACTIVITY',
            label: `Start activity ${action.data.name}`,
            activity: action.data,
            state,
          });
          activities[action.data.name] = yield fork(action.data, event);
        } else if (action.type === 'xstate.stop') {
          logger({
            type: 'STATE_MACHINE_STOP_ACTIVITY',
            label: `Stop activity ${action.data.name}`,
            activity: action.data,
            state,
          });
          activities[action.data.name].cancel();
        } else {
          logger({
            type: 'STATE_MACHINE_ACTION',
            label: `Action ${action.name}`,
            action,
            state,
            event,
          });
          action({ getState, dispatch }, event);
        }
      }
    };

    const { setState, selectState, ...config } = description;
    const machine = Machine(config);

    logger({
      type: 'STATE_MACHINE_START',
      label: `Starting ${description.key}`,
      description,
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
    yield* runActions(initial, {});

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

      const result = machine.transition(state, event, { getState, dispatch });
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
