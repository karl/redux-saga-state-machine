import { createStateMachineSaga } from 'redux-saga-state-machine';
import { call } from 'redux-saga/effects';
import { delay } from 'redux-saga';

export const stateMachineSaga = createStateMachineSaga({
  states: {
    'red': {},
    'yellow': {},
    'green': {}
  }
});

export const anotherSaga = function* () {
  console.log('start');
  yield call(delay, 2000);
  console.log('end');
};
