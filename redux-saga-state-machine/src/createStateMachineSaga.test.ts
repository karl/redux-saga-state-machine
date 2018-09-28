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

  const actions = {
    play: () => ({ type: 'play' }),
    playInternal: () => ({ type: 'playInternal' }),
    sameInternal: () => ({ type: 'sameInternal' }),
    falseConditional: () => ({ type: 'falseConditional' }),
    trueConditional: () => ({ type: 'trueConditional' }),
    unknown: () => ({ type: 'unknown' }),
  };

  const action1 = jest.fn();
  const action2 = jest.fn();
  const activityStarted = jest.fn();
  const onEntryApp = jest.fn();
  const onExitApp = jest.fn();
  const activityCancelled = jest.fn();
  const activityComplete = jest.fn();
  const condTrue = jest.fn(() => true);
  const condFalse = jest.fn(() => false);
  const activity = function*(action) {
    try {
      activityStarted(action);
      yield delay(5000);
      activityComplete();
    } finally {
      if (yield cancelled()) {
        activityCancelled();
      }
    }
  };

  let harness;
  let stateMachine;
  let saga;
  beforeEach(() => {
    jest.clearAllMocks();
    harness = createHarness();

    stateMachine = {
      key: 'test-state-machine',
      // debug: true,
      setState: harness.setState,
      selectState: harness.selectState,
      initial: 'APP',
      states: {
        APP: {
          onEntry: [onEntryApp],
          onExit: [onExitApp],
          activities: [activity],
          on: {
            play: 'PLAYER',
            playInternal: [{ target: 'PLAYER', internal: true }],
            sameInternal: [
              { target: 'APP', internal: true, actions: [action1, action2] },
            ],
            falseConditional: [{ target: 'PLAYER', cond: condFalse }],
            trueConditional: [{ target: 'PLAYER', cond: condTrue }],
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
    expect(activityStarted).toHaveBeenCalledWith({});
  });

  it('cancels activities when transitioning to a new state', () => {
    harness.run(saga);
    harness.dispatch(actions.play());
    expect(activityCancelled).toHaveBeenCalled();
  });

  it('if an activity runs to completion it does not get cancelled when transitioning to a new state', () => {
    harness.run(saga);
    harness.clock.tick(5001);
    expect(activityComplete).toHaveBeenCalled();
    harness.dispatch(actions.play());
    expect(activityCancelled).not.toHaveBeenCalled();
  });

  it('when transition is internal activities remain running when transitioning to the same state', () => {
    harness.run(saga);
    harness.dispatch(actions.sameInternal());
    expect(activityCancelled).not.toHaveBeenCalled();
  });

  it('when transition is internal onEntry and onExit is not run when transitioning to the same state', () => {
    harness.run(saga);
    jest.clearAllMocks();
    harness.dispatch(actions.sameInternal());
    expect(onEntryApp).not.toHaveBeenCalled();
    expect(onExitApp).not.toHaveBeenCalled();
  });

  it('runs actions even when the state remains unchanged', () => {
    harness.run(saga);
    harness.dispatch(actions.sameInternal());
    expect(action1).toHaveBeenCalledWith(
      harness.firstArg,
      actions.sameInternal(),
    );
    expect(action2).toHaveBeenCalledWith(
      harness.firstArg,
      actions.sameInternal(),
    );
  });

  it('transitions based on redux action', () => {
    harness.run(saga);
    harness.dispatch(actions.play());
    expect(harness.state.machineState).toEqual('PLAYER');
  });

  it('when leaving a state runs onExit', () => {
    harness.run(saga);
    harness.dispatch(actions.play());
    expect(onExitApp).toHaveBeenCalledWith(harness.firstArg, actions.play());
  });

  it('when leaving a state, if the transition is marked as internal but moves to a different state,  runs onExit', () => {
    harness.run(saga);
    harness.dispatch(actions.playInternal());
    expect(onExitApp).toHaveBeenCalledWith(
      harness.firstArg,
      actions.playInternal(),
    );
  });

  it('when there is a redux action with no transitions, state is unchanged and activities keep running', () => {
    harness.run(saga);
    jest.clearAllMocks();
    harness.dispatch(actions.unknown());
    expect(onEntryApp).not.toHaveBeenCalled();
    expect(onExitApp).not.toHaveBeenCalled();
    expect(activityCancelled).not.toHaveBeenCalled();
  });

  it('when conditional returns false, state is unchanged and activities keep running', () => {
    harness.run(saga);
    jest.clearAllMocks();
    harness.dispatch(actions.falseConditional());
    expect(condFalse).toHaveBeenCalledWith(
      harness.firstArg,
      actions.falseConditional(),
      'APP',
    );
    expect(onEntryApp).not.toHaveBeenCalled();
    expect(onExitApp).not.toHaveBeenCalled();
    expect(activityCancelled).not.toHaveBeenCalled();
  });

  it('when conditional returns true transitions to new state', () => {
    harness.run(saga);
    jest.clearAllMocks();
    harness.dispatch(actions.trueConditional());
    expect(harness.state.machineState).toEqual('PLAYER');
  });
});
