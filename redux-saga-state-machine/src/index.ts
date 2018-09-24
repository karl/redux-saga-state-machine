import { SagaIterator } from 'redux-saga';
import { fork, put, take } from 'redux-saga/effects';
import { Machine } from 'xstate';

type ActionCreator = (
  state: any,
) => {
  type: string;
};

type StateMachineDescription = {
  key: string;
  debug?: boolean;
  setState: ActionCreator;
  selectState: (state: any) => string;
  states: any;
};

// tslint:disable-next-line:no-empty
const noop = () => {};

const objectMap = (object, mapFn) => {
  return Object.keys(object).reduce((result, key) => {
    result[key] = mapFn(object[key], key);
    return result;
  }, {});
};

const getKeyByValue = (object, value) => {
  return Object.keys(object).find((key) => object[key] === value);
};

let id = 0;

const getActionName = (actionsMap, action) => {
  const existing = getKeyByValue(actionsMap, action);
  if (existing) {
    return existing;
  }

  const simple = `${action.name}`;
  if (
    simple !== '' &&
    simple !== 'null' &&
    simple !== 'undefined' &&
    actionsMap[simple] === undefined
  ) {
    return simple;
  }

  return `${action.name}-${id++}`;
};

const toXstateConfig = (config) => {
  const actionsMap: any = {};

  const mapState = (state) => {
    const newState = {
      ...state,
    };

    if (state.on) {
      newState.on = objectMap(state.on, (on) => {
        if (typeof on === 'string') {
          return on;
        }

        const mapTransition = (transition) => {
          const newTransition = { ...transition };

          // if (transition.cond) {
          //   const name = getActionName(actionsMap, transition.cond);
          //   actionsMap[name] = transition.cond;
          //   newTransition.cond = name;
          // }

          if (transition.actions) {
            const newActions: any = [];
            for (const action of transition.actions) {
              const name = getActionName(actionsMap, action);
              actionsMap[name] = action;
              newActions.push({ type: name });
            }
            newTransition.actions = newActions;
          }

          return newTransition;
        };

        if (Array.isArray(on)) {
          return on.map((transition) => mapTransition(transition));
        }
        return mapTransition(on);
      });
    }

    if (state.onEntry) {
      const name = getActionName(actionsMap, state.onEntry);
      actionsMap[name] = state.onEntry;
      newState.onEntry = { type: name };
    }

    if (state.onExit) {
      const name = getActionName(actionsMap, state.onExit);
      actionsMap[name] = state.onExit;
      newState.onExit = { type: name };
    }

    if (state.activities) {
      const newActivities: string[] = [];
      for (const activity of state.activities) {
        const name = getActionName(actionsMap, activity);
        actionsMap[name] = activity;
        newActivities.push(name);
      }
      newState.activities = newActivities;
    }

    if (state.states) {
      newState.states = objectMap(state.states, (s) => mapState(s));
    }

    return newState;
  };

  const xstateConfig = {
    ...config,
    states: objectMap(config.states, (state) => mapState(state)),
  };

  return {
    xstateConfig,
    actionsMap,
  };
};

export const createStateMachineSaga = (
  description: StateMachineDescription,
  { emit = noop }: any = {},
) => {
  const logger = (obj: any) => {
    emit({
      ...obj,
      key: description.key,
    });

    if (description.debug) {
      const { type, label, ...details } = obj;
      // tslint:disable-next-line:no-console
      console.log(description.key + ': ' + label, details);
    }
  };

  return function*({
    getState,
    dispatch,
  }: {
    getState: any;
    dispatch: any;
  }): SagaIterator {
    const activities: any[] = [];

    const { setState, selectState, ...config } = description;
    const { xstateConfig, actionsMap } = toXstateConfig(config);

    const runActions = function*(result: any, event: any) {
      for (const action of result.actions as any[]) {
        if (action.type === 'xstate.start') {
          const actionFunc = actionsMap[action.data.type];
          logger({
            type: 'STATE_MACHINE_START_ACTIVITY',
            label: `Start activity ${action.data.type}`,
            action,
            state,
          });
          activities[action.data.type] = yield fork(actionFunc, event);
        } else if (action.type === 'xstate.stop') {
          logger({
            type: 'STATE_MACHINE_STOP_ACTIVITY',
            label: `Stop activity ${action.data.type}`,
            action,
            state,
          });
          activities[action.data.type].cancel();
        } else {
          const actionFunc: any = actionsMap[action.type];
          logger({
            type: 'STATE_MACHINE_ACTION',
            label: `Action ${action.type}`,
            action,
            state,
            event,
          });
          actionFunc({ getState, dispatch }, event);
        }
      }
    };

    const machine = Machine(xstateConfig);

    logger({
      type: 'STATE_MACHINE_START',
      label: `Starting ${description.key}`,
      description,
      xstateConfig,
      actionsMap,
    });

    const initial = machine.initialState;
    let state = initial.value;
    logger({
      type: 'STATE_MACHINE_INITIAL_STATE',
      label: `Initial state ${state}`,
      state,
      initial,
    });
    yield put(setState(state));
    // Note: Initial activities are passed an empty action object (no type field!)
    yield* runActions(initial, {});

    while (true) {
      const stateNodes = machine.getStateNodes(state);
      const events = stateNodes[0].events;

      logger({
        type: 'STATE_MACHINE_LISTENING',
        label: `Listening for events ${events.join(', ')}`,
        state,
        events,
      });
      const event = yield take(events);
      logger({
        type: 'STATE_MACHINE_RECEIVED',
        label: `Received event ${event.type}`,
        event,
        state,
      });

      const result = machine.transition(state, event, { getState, dispatch });
      if (result.value === state) {
        logger({
          type: 'STATE_MACHINE_NO_TRANSITION',
          label: `No transition`,
          result,
        });
      } else {
        state = result.value;
        logger({
          type: 'STATE_MACHINE_NEW_STATE',
          label: `State ${state}`,
          state,
          result,
        });
        yield put(setState(state));
      }

      yield* runActions(result, event);
    }
  };
};
