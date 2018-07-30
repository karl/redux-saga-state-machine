import { delay } from 'redux-saga';
import { put } from 'redux-saga/effects';

export const reducerKey = 'trafficLights';

const states = {
  GREEN: 'GREEN',
  YELLOW: 'YELLOW',
  RED: 'RED',
  WAIT: 'WAIT',
  WALK: 'WALK',
  STOP: 'STOP',
};

const constants = {
  TIMER: reducerKey + '/TIMER',
  PED_TIMER: reducerKey + '/PED_TIMER',
  SET_CURRENT_STATE: reducerKey + '/SET_CURRENT_STATE',
};

export const actions = {
  timer: () => {
    return {
      type: constants.TIMER,
    };
  },
  pedTimer: () => {
    return {
      type: constants.PED_TIMER,
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
  currentState: null,
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

const pedSwitchTimer = function*() {
  yield delay(2500);
  yield put(actions.pedTimer());
};

export const stateMachine = {
  key: 'traffic-lights',
  debug: true,
  setState: actions.setCurrentState,
  selectState: selectors.selectCurrentState,
  initial: states.GREEN,
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
      initial: states.WALK,
      states: {
        [states.WALK]: {
          activities: [pedSwitchTimer],
          on: {
            [constants.PED_TIMER]: states.WAIT,
          },
        },
        [states.WAIT]: {
          activities: [pedSwitchTimer],
          on: {
            [constants.PED_TIMER]: states.STOP,
          },
        },
        [states.STOP]: {},
      },
    },
  },
};
