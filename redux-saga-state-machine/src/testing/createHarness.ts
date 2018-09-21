import * as lolex from 'lolex';
import { runSaga, Task } from 'redux-saga';

type Harness = {
  clock: lolex.Clock;
  state: {
    machineState: any;
  };
  dispatch: jest.Mock<{}>;
  firstArg: {
    dispatch: jest.Mock<{}>;
    getState: jest.Mock<{
      machineState: any;
    }>;
  };
  setState: jest.Mock<{
    type: string;
    payload: any;
  }>;
  selectState: jest.Mock;
  run: (saga: any) => Task;
};

export const createHarness = (): Harness => {
  const clock = lolex.install();

  const state = {
    machineState: null,
  };

  let callbacks: Array<(action: any) => void> = [];
  const getState = jest.fn(() => state);
  const dispatch = jest.fn((action) => {
    for (const callback of callbacks) {
      callback(action);
    }
  });
  const setState = jest.fn((machineState) => {
    state.machineState = machineState;
    return { type: 'SET_STATE', payload: machineState };
  });
  const selectState = jest.fn(() => state.machineState);
  const subscribe = (callback: (action: any) => void) => {
    callbacks = [...callbacks, callback];
    return () => {
      callbacks = callbacks.filter((c) => c !== callback);
    };
  };

  const firstArg = {
    dispatch,
    getState,
  };

  const run = (saga: any) => {
    return runSaga(
      {
        getState,
        dispatch,
        subscribe,
      },
      saga,
      {
        getState,
        dispatch,
      },
    );
  };

  return {
    clock,
    state,
    dispatch,
    firstArg,
    setState,
    selectState,
    run,
  };
};
