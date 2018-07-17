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
  setState: ActionCreator;
  selectState: (state: any) => string;
  states: any;
}

export const createStateMachineSaga = (description: IMachineDescription) => {
  // tslint:disable-next-line:no-console
  console.log('createStateMachineSaga', description);

  const { setState, selectState, ...config } = description;

  const machine = Machine(config);

  return function*(): SagaIterator {
    // tslint:disable-next-line:no-console
    console.log('running saga', machine);

    while (true) {
      const state = yield select(selectState);
      // tslint:disable-next-line:no-console
      console.log('Current state', state);

      // tslint:disable-next-line:no-console
      console.log('Events', machine.events);
      const event = yield take(machine.events);
      // tslint:disable-next-line:no-console
      console.log('Event', event);

      const newState = machine.transition(state, event, {});
      // tslint:disable-next-line:no-console
      console.log('New state', newState);

      yield put(setState(newState.value));
    }
  };
};
