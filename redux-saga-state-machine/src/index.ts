import { SagaIterator } from 'redux-saga';
import { fork, put, select, take } from 'redux-saga/effects';
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
  { emit = noop }: { emit: any } = {},
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
    const activities = [];

    const { setState, selectState, ...config } = description;
    const machine = Machine(config);

    logger({
      type: 'STATE_MACHINE_START',
      label: `Starting ${description.key}`,
      description,
    });

    const initialState = yield select(selectState);
    logger({
      type: 'STATE_MACHINE_INITIAL_STATE',
      label: `Initial state ${initialState}`,
      state: initialState,
    });

    while (true) {
      const state = yield select(selectState);

      logger({
        type: 'STATE_MACHINE_LISTENING',
        label: `Listening for events ${machine.events}`,
        state,
        events: machine.events,
      });
      const event = yield take(machine.events);
      logger({
        type: 'STATE_MACHINE_RECEIVED',
        label: `Received event ${event.type}`,
        event,
        state,
      });

      const result = machine.transition(state, event, { getState, dispatch });
      const newState = result.value;

      if (newState === state) {
        logger({
          type: 'STATE_MACHINE_NO_TRANSITION',
          label: `No transition`,
        });
        continue;
      }

      logger({
        type: 'STATE_MACHINE_NEW_STATE',
        label: `State ${newState}`,
        state: newState,
        result,
      });
      yield put(setState(newState));

      for (const action of result.actions as any[]) {
        if (action.type === 'xstate.start') {
          logger({
            type: 'STATE_MACHINE_START_ACTIVITY',
            label: `Start activity ${action.data.name}`,
            state: newState,
          });
          activities[action.data.name] = yield fork(action.data);
        } else if (action.type === 'xstate.stop') {
          logger({
            type: 'STATE_MACHINE_STOP_ACTIVITY',
            label: `Stop activity ${action.data.name}`,
            state: newState,
          });
          activities[action.data.name].cancel();
        } else {
          logger({
            type: 'STATE_MACHINE_ACTION',
            label: `Action ${action.name}`,
            state: newState,
          });
          action({ getState, dispatch }, event);
        }
      }
    }
  };
};
