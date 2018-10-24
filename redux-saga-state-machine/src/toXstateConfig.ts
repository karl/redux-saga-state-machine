import {
  MachineConfig,
  SimpleOrCompoundStateNodeConfig,
  TargetTransitionConfig,
} from 'xstate/lib/types';
import {
  Action,
  ActionsMap,
  Activity,
  MachineDescription,
  StateNode,
  Transition,
} from './types';

const objectMap = <S, T>(
  object: Record<string, S>,
  mapFn: (obj: S, key: string) => T,
): Record<string, T> => {
  const initial: Record<string, T> = {};
  return Object.keys(object).reduce((result, key) => {
    result[key] = mapFn(object[key], key);
    return result;
  }, initial);
};

const getKeyByValue = <T>(
  object: Record<string, T>,
  value: T,
): string | undefined => {
  return Object.keys(object).find((key) => object[key] === value);
};

let id = 0;

const getActionOrActivityName = (
  actionsMap: ActionsMap,
  action: Action | Activity,
) => {
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

  // TODO: Handle name being empty.
  // TODO: What do we do about minified names?
  return `${action.name}-${id++}`;
};

export const toXstateConfig = (
  description: MachineDescription,
): {
  xstateConfig: MachineConfig;
  actionsMap: ActionsMap;
} => {
  const actionsMap: ActionsMap = {};

  const mapState = (state: StateNode): SimpleOrCompoundStateNodeConfig => {
    let newState: SimpleOrCompoundStateNodeConfig;

    if (state.states) {
      newState = {
        states: objectMap(state.states, (s) => mapState(s)),
      };
    } else {
      newState = {};
    }

    if (state.initial) {
      newState.initial = state.initial;
    }

    if (state.parallel) {
      newState.parallel = state.parallel;
    }

    if (state.on) {
      newState.on = objectMap(state.on, (on) => {
        if (typeof on === 'string') {
          return on;
        }

        const mapTransition = (transition: Transition) => {
          const newTransition: TargetTransitionConfig = {
            ...transition,
          };

          // TODO: In the future we will also map guards to strings
          // and pass xstate a map of guard names to functions.

          // if (transition.cond) {
          //   const name = getActionName(actionsMap, transition.cond);
          //   actionsMap[name] = transition.cond;
          //   newTransition.cond = name;
          // }

          if (transition.actions) {
            const newActions: string[] = [];
            for (const action of transition.actions) {
              const name = getActionOrActivityName(actionsMap, action);
              actionsMap[name] = action;
              newActions.push(name);
            }
            newTransition.actions = newActions;
          }

          return newTransition;
        };

        return on.map((transition) => mapTransition(transition));
      });
    }

    if (state.onEntry) {
      const newOnEntry: string[] = [];
      for (const onEntry of state.onEntry) {
        const name = getActionOrActivityName(actionsMap, onEntry);
        actionsMap[name] = onEntry;
        newOnEntry.push(name);
      }
      newState.onEntry = newOnEntry;
    }

    if (state.onExit) {
      const newOnExit: string[] = [];
      for (const onExit of state.onExit) {
        const name = getActionOrActivityName(actionsMap, onExit);
        actionsMap[name] = onExit;
        newOnExit.push(name);
      }
      newState.onExit = newOnExit;
    }

    if (state.activities) {
      const newActivities: string[] = [];
      for (const activity of state.activities) {
        const name = getActionOrActivityName(actionsMap, activity);
        actionsMap[name] = activity;
        newActivities.push(name);
      }
      newState.activities = newActivities;
    }

    return newState;
  };

  const xstateConfig = {
    ...description,
    key: description.key,
    initial: description.initial,
    states: objectMap(description.states, (state) => mapState(state)),
  };

  return {
    xstateConfig,
    actionsMap,
  };
};
