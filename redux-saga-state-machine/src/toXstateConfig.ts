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

export const toXstateConfig = (description) => {
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

          // TODO: In the future we will also map guards to strings
          // and pass xstate a map of guard names to functions.

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

  const { setState, selectState, ...config } = description;

  const xstateConfig = {
    ...config,
    states: objectMap(config.states, (state) => mapState(state)),
  };

  return {
    xstateConfig,
    actionsMap,
  };
};
