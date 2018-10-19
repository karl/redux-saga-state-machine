export const matchState = (state, ...states) => {
  if (states.length === 0) {
    return true;
  }

  const [nextState, ...rest] = states;
  if (state === nextState) {
    return true;
  }

  if (state[nextState]) {
    return matchState(state[nextState], ...rest);
  }

  return false;
};
