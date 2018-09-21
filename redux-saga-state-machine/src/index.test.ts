import * as lolex from 'lolex';
import { runSaga } from 'redux-saga';
import { createStateMachineSaga } from './index';

describe('createStateMachineSaga', () => {
  const action1 = jest.fn();
  const action2 = jest.fn();

  let clock: lolex.Clock;
  let state: any;
  let callbacks: Array<(action: any) => void>;
  let getState: any;
  let dispatch: any;
  let setState: any;
  let selectState: any;
  let subscribe: any;
  beforeEach(() => {
    clock = lolex.install();

    state = {
      machineState: null,
    };

    callbacks = [];
    getState = jest.fn(() => state);
    dispatch = jest.fn((action) => {
      for (const callback of callbacks) {
        callback(action);
      }
    });
    setState = jest.fn((machineState) => {
      state.machineState = machineState;
      return { type: 'SET_STATE', payload: machineState };
    });
    selectState = jest.fn(() => state.machineState);
    subscribe = (callback: (action: any) => void) => {
      callbacks = [...callbacks, callback];
      return () => {
        callbacks = callbacks.filter((c) => c !== callback);
      };
    };
  });

  afterEach(() => {
    clock.uninstall();
  });

  it('gets initial state from description', () => {
    const stateMachine = {
      key: 'test-state-machine',
      // debug: true,
      setState,
      selectState,
      initial: 'APP',
      states: {
        APP: {
          on: {
            play: 'PLAYER',
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

    expect(state.machineState).toEqual('APP');
  });

  it('transitions based on redux action', () => {
    const stateMachine = {
      key: 'test-state-machine',
      // debug: true,
      setState,
      selectState,
      initial: 'APP',
      states: {
        APP: {
          on: {
            play: 'PLAYER',
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

    expect(state.machineState).toEqual('PLAYER');
  });

  it('runs actions even when the state remains unchanged', () => {
    const stateMachine = {
      key: 'test-state-machine',
      // debug: true,
      setState,
      selectState,
      initial: 'APP',
      states: {
        APP: {
          on: {
            play: [{ target: 'APP', actions: [action1, action2] }],
          },
        },
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
