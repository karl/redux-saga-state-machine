import { delay } from 'redux-saga';
import { cancelled } from 'redux-saga/effects';
import { createStateMachineSaga } from './createStateMachineSaga';
import { createHarness } from './testing/createHarness';

describe('createStateMachineSaga', () => {
  // Use this for debugging as it fully expands objects (the default console.log
  // leaves sub objects opaque).
  // @ts-ignore
  const emit = (emitted) => {
    const { key, type, label, ...details } = emitted;
    // tslint:disable-next-line:no-console
    console.log(key, label, JSON.stringify(details, null, 2));
  };

  let harness;
  let action1;
  let action2;
  let activityStart;
  let onEntryApp;
  let activityCancel;
  let activity;
  let stateMachine;
  beforeEach(() => {
    harness = createHarness();

    action1 = jest.fn();
    action2 = jest.fn();
    activityStart = jest.fn();
    onEntryApp = jest.fn();
    activityCancel = jest.fn();
    activity = function*(action) {
      try {
        activityStart(action);
        yield delay(5000);
      } finally {
        if (yield cancelled()) {
          activityCancel();
        }
      }
    };

    stateMachine = {
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
            sameInternal: [
              { target: 'APP', internal: true, actions: [action1, action2] },
            ],
          },
        },
        PLAYER: {},
      },
    };
  });

  afterEach(() => {
    harness.clock.uninstall();
  });

  it('gets initial state from description', () => {
    const saga = createStateMachineSaga(stateMachine);

    harness.run(saga);

    expect(harness.state.machineState).toEqual('APP');
  });

  it('run activities and onEntry for initial state', () => {
    const saga = createStateMachineSaga(stateMachine);

    harness.run(saga);

    // Note: Initial activities and onEntry are passed an empty action object (no type field!)
    expect(onEntryApp).toHaveBeenCalledWith(harness.firstArg, {});
    expect(activityStart).toHaveBeenCalledWith({});
  });

  it('cancels initial state activities when transitioning to a new state', () => {
    const saga = createStateMachineSaga(stateMachine);

    harness.run(saga);

    const playAction = { type: 'play' };
    harness.dispatch(playAction);

    expect(activityCancel).toHaveBeenCalled();
  });

  it('when transition is internal activities remain running when transitioning to the same state', () => {
    const saga = createStateMachineSaga(stateMachine);

    harness.run(saga);

    const internalAction = { type: 'sameInternal' };
    harness.dispatch(internalAction);

    expect(activityCancel).not.toHaveBeenCalled();
  });

  it('runs actions even when the state remains unchanged', () => {
    const saga = createStateMachineSaga(stateMachine);

    harness.run(saga);

    const internalAction = { type: 'sameInternal' };
    harness.dispatch(internalAction);

    expect(action1).toHaveBeenCalledWith(harness.firstArg, internalAction);
    expect(action2).toHaveBeenCalledWith(harness.firstArg, internalAction);
  });

  it('transitions based on redux action', () => {
    const saga = createStateMachineSaga(stateMachine);

    harness.run(saga);

    const playAction = { type: 'play' };
    harness.dispatch(playAction);

    expect(harness.state.machineState).toEqual('PLAYER');
  });
});
