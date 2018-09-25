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

  const play = () => ({ type: 'play' });
  const sameInternal = () => ({ type: 'sameInternal' });

  let harness;
  let action1;
  let action2;
  let activityStart;
  let onEntryApp;
  let activityCancel;
  let activity;
  let stateMachine;
  let saga;
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

    saga = createStateMachineSaga(stateMachine);
  });

  afterEach(() => {
    harness.clock.uninstall();
  });

  it('gets initial state from description', () => {
    harness.run(saga);
    expect(harness.state.machineState).toEqual('APP');
  });

  it('run activities and onEntry for initial state', () => {
    harness.run(saga);
    // Note: Initial activities and onEntry are passed an empty action object (no type field!)
    expect(onEntryApp).toHaveBeenCalledWith(harness.firstArg, {});
    expect(activityStart).toHaveBeenCalledWith({});
  });

  it('cancels initial state activities when transitioning to a new state', () => {
    harness.run(saga);
    harness.dispatch(play());
    expect(activityCancel).toHaveBeenCalled();
  });

  it('when transition is internal activities remain running when transitioning to the same state', () => {
    harness.run(saga);
    harness.dispatch(sameInternal());
    expect(activityCancel).not.toHaveBeenCalled();
  });

  it('runs actions even when the state remains unchanged', () => {
    harness.run(saga);
    harness.dispatch(sameInternal());
    expect(action1).toHaveBeenCalledWith(harness.firstArg, sameInternal());
    expect(action2).toHaveBeenCalledWith(harness.firstArg, sameInternal());
  });

  it('transitions based on redux action', () => {
    harness.run(saga);
    harness.dispatch(play());
    expect(harness.state.machineState).toEqual('PLAYER');
  });
});
