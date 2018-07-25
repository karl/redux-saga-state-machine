import { delay } from 'redux-saga';
import { put } from 'redux-saga/effects';

export const reducerKey = 'trafficLights';

const states = {
  GREEN: 'GREEN',
  YELLOW: 'YELLOW',
  RED: 'RED',
};

const constants = {
  TIMER: reducerKey + '/TIMER',
  SET_CURRENT_STATE: reducerKey + '/SET_CURRENT_STATE',
};

export const actions = {
  timer: () => {
    return {
      type: constants.TIMER,
    };
  },

  setCurrentState: (state: string) => {
    return {
      type: constants.SET_CURRENT_STATE,
      payload: {
        state,
      },
    };
  },
};

const initialState = {
  currentState: states.GREEN,
};

export const reducer = (state = initialState, action: any) => {
  if (action.type === constants.SET_CURRENT_STATE) {
    return {
      ...state,
      currentState: action.payload.state,
    };
  }
  return state;
};

export const selectors = {
  selectRoot: (state: any) => state[reducerKey],
  selectCurrentState: (state: any) => selectors.selectRoot(state).currentState,
};

const switchTimer = function*() {
  yield delay(6000);
  yield put(actions.timer());
};

export const stateMachine = {
  key: 'traffic-lights',
  debug: true,
  setState: actions.setCurrentState,
  selectState: selectors.selectCurrentState,
  states: {
    [states.GREEN]: {
      activities: [switchTimer],
      on: {
        [constants.TIMER]: states.YELLOW,
      },
    },
    [states.YELLOW]: {
      activities: [switchTimer],
      on: {
        [constants.TIMER]: states.RED,
      },
    },
    [states.RED]: {
      activities: [switchTimer],
      on: {
        [constants.TIMER]: states.GREEN,
      },
    },
  },
};
