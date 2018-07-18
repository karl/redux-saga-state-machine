import { SagaIterator } from 'redux-saga';
import { put, select, take } from 'redux-saga/effects';
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

  const { setState, selectState, ...config } = description;

  const machine = Machine(config);

  return function*(): SagaIterator {
    log('running saga', machine);

    while (true) {
      const state = yield select(selectState);
      log('Current state', state);

      log('Listening for events', machine.events);
      const event = yield take(machine.events);
      log('Received event', event);

      const fullState = yield select();
      const result = machine.transition(state, event, { fullState });
      log('New state', result);
      log('Actions', result.actions.map((action) => action.name));

      for (const action of result.actions) {
        yield* action();
      }

      yield put(setState(result.value));
    }
  };
};
