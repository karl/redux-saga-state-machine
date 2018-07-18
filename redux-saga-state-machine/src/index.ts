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

export const createStateMachineSaga = (description: IMachineDescription) => {
  const log = (text: string, ...args: any[]) => {
    if (description.debug) {
      // tslint:disable-next-line:no-console
      console.log(description.key + ': ' + text, ...args);
    }
  };

  log('createStateMachineSaga', description);

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

    log('running saga', machine);

    while (true) {
      const state = yield select(selectState);
      log('Current state', state);

      log('Listening for events', machine.events);
      const event = yield take(machine.events);
      log('Received event', event);

      const result = machine.transition(state, event, { getState, dispatch });

      log('New state', result);
      yield put(setState(result.value));

      for (const action of result.actions as any[]) {
        if (action.type === 'xstate.start') {
          log('Start activity', action.data.name);
          activities[action.data.name] = yield fork(action.data);
        } else if (action.type === 'xstate.stop') {
          log('Stop activity', action.data.name);
          activities[action.data.name].cancel();
        } else {
          log('Action', action.name);
          action({ getState, dispatch }, event);
        }
      }
    }
  };
};
