import { delay } from 'redux-saga';
import { cancelled } from 'redux-saga/effects';
import { createStateMachineSaga } from './index';
import { createHarness } from './testing/createHarness';

describe('createStateMachineSaga', () => {
  const action1 = jest.fn();
  const action2 = jest.fn();
  const activity1Inner = jest.fn();
  const activity1 = function*(action: any): any {
    activity1Inner(action);
  };
  const onEntryApp = jest.fn();

  let harness: any;
  beforeEach(() => {
    harness = createHarness();
  });

  afterEach(() => {
    harness.clock.uninstall();
  });

  it('gets initial state from description', () => {
    const stateMachine = {
      key: 'test-state-machine',
      // debug: true,
      setState: harness.setState,
      selectState: harness.selectState,
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

    harness.run(saga);

    expect(harness.state.machineState).toEqual('APP');
  });

  it('run activities (but not onEntry) for initial state', () => {
    const stateMachine = {
      key: 'test-state-machine',
      // debug: true,
      setState: harness.setState,
      selectState: harness.selectState,
      initial: 'APP',
      states: {
        APP: {
          onEntryApp,
          activities: [activity1],
          on: {
            play: 'PLAYER',
          },
        },
        PLAYER: {},
      },
    };

    const saga = createStateMachineSaga(stateMachine);

    harness.run(saga);

    // Note: Initial activities are passed an empty action object (no type field!)
    expect(activity1Inner).toHaveBeenCalledWith({});
  });

  it('cancels initial state activities when transitioning to a new state', () => {
    const activityCancel = jest.fn();
    const activity = function*() {
      try {
        yield delay(5000);
      } finally {
        if (yield cancelled()) {
          activityCancel();
        }
      }
    };

    const stateMachine = {
      key: 'test-state-machine',
      // debug: true,
      setState: harness.setState,
      selectState: harness.selectState,
      initial: 'APP',
      states: {
        APP: {
          onEntryApp,
          activities: [activity],
          on: {
            play: 'PLAYER',
          },
        },
        PLAYER: {},
      },
    };

    const saga = createStateMachineSaga(stateMachine);

    harness.run(saga);

    const playAction = { type: 'play' };
    harness.dispatch(playAction);

    expect(activityCancel).toHaveBeenCalled();
  });

  it('transitions based on redux action', () => {
    const stateMachine = {
      key: 'test-state-machine',
      // debug: true,
      setState: harness.setState,
      selectState: harness.selectState,
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

    harness.run(saga);

    const playAction = { type: 'play' };
    harness.dispatch(playAction);

    expect(harness.state.machineState).toEqual('PLAYER');
  });

  it('runs actions even when the state remains unchanged', () => {
    const stateMachine = {
      key: 'test-state-machine',
      // debug: true,
      setState: harness.setState,
      selectState: harness.selectState,
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

    harness.run(saga);

    const playAction = { type: 'play' };
    harness.dispatch(playAction);

    expect(action1).toHaveBeenCalledWith(harness.firstArg, playAction);
    expect(action2).toHaveBeenCalledWith(harness.firstArg, playAction);
  });
});
