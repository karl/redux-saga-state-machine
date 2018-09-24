import { delay } from 'redux-saga';
import { cancelled } from 'redux-saga/effects';
import { createStateMachineSaga } from '.';
import { createHarness } from './testing/createHarness';

describe('createStateMachineSaga', () => {
  const action1 = jest.fn();
  const action2 = jest.fn();
  const activity1Inner = jest.fn();
  const activity1 = function*(action: any): any {
    activity1Inner(action);
  };
  const onEntryApp = jest.fn();

  // Use this for debugging as it fully expands objects (the default console.log
  // leave sub objects opaque).
  // @ts-ignore
  const emit = (emitted) => {
    const { key, type, label, ...details } = emitted;
    // tslint:disable-next-line:no-console
    console.log(key, label, JSON.stringify(details, null, 2));
  };

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

  it('run activities and onEntry for initial state', () => {
    const stateMachine = {
      key: 'test-state-machine',
      // debug: true,
      setState: harness.setState,
      selectState: harness.selectState,
      initial: 'APP',
      states: {
        APP: {
          onEntry: [onEntryApp],
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

    // Note: Initial activities and onEntry are passed an empty action object (no type field!)
    expect(onEntryApp).toHaveBeenCalledWith(harness.firstArg, {});
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
          onEntry: [onEntryApp],
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

  it('when internal activities remain running when transitioning to the same state', () => {
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
          onEntry: [onEntryApp],
          activities: [activity],
          on: {
            play: [{ target: 'APP', internal: true }],
          },
        },
        PLAYER: {},
      },
    };

    const saga = createStateMachineSaga(stateMachine);

    harness.run(saga);

    const playAction = { type: 'play' };
    harness.dispatch(playAction);

    expect(activityCancel).not.toHaveBeenCalled();
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
