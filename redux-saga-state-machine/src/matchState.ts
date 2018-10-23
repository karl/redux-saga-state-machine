import { StateValue } from './types';

export const matchState = (state: StateValue, ...states: string[]): boolean => {
  if (states.length === 0) {
    return true;
  }

  const [nextState, ...rest] = states;
  if (state === nextState) {
    return true;
  }

  if (typeof state === 'string') {
    return false;
  }

  if (state[nextState]) {
    return matchState(state[nextState], ...rest);
  }

  return false;
};
