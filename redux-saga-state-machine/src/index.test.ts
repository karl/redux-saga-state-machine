import * as lolex from 'lolex';
import { runSaga } from 'redux-saga';
import { createStateMachineSaga } from './index';

describe('createStateMachineSaga', () => {
  let clock;
  beforeEach(() => {
    clock = lolex.install();
  });

  afterEach(() => {
    clock.uninstall();
  });

  it('runs actions even when the state remains unchanged', () => {
    const state = {
      machineState: null,
    };

    let callbacks = [];
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
    const subscribe = (callback) => {
      callbacks = [...callbacks, callback];
      return () => {
        callbacks = callbacks.filter((c) => c !== callback);
      };
    };

    const action1 = jest.fn();
    const action2 = jest.fn();

    const stateMachine = {
      key: 'test-state-machine',
      debug: true,
      setState,
      selectState,
      initial: 'APP',
      states: {
        APP: {
          on: {
            play: [{ target: 'APP', actions: [action1, action2] }],
          },
        },
        PLAYER: {},
      },
    };

    const saga = createStateMachineSaga(stateMachine);

    runSaga(
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

    const playAction = { type: 'play' };
    dispatch(playAction);

    expect(action1).toHaveBeenCalledWith({ dispatch, getState }, playAction);
    expect(action2).toHaveBeenCalledWith({ dispatch, getState }, playAction);
  });
});
