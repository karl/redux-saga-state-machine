import { delay } from 'redux-saga';
import { MachineDescription } from 'redux-saga-state-machine';
import { put } from 'redux-saga/effects';
import { createActions } from './createAction';

export const reducerKey = 'trafficLights';

export const states = {
  GREEN: 'GREEN',
  YELLOW: 'YELLOW',
  RED: 'RED',
  WAIT: 'WAIT',
  WALK: 'WALK',
  STOP: 'STOP',
};

const createAction = createActions(reducerKey);
export const actions = {
  timer: createAction('TIMER'),
  pedTimer: createAction('PED_TIMER'),
  setCurrentState: createAction('SET_CURRENT_STATE'),
};

const initialState = {
  currentState: null,
};

export const reducer = (state = initialState, { type, payload }) => {
  if (type === actions.setCurrentState.type) {
    return {
      ...state,
      currentState: payload,
    };
  }
  return state;
};

export const selectors = {
  selectRoot: (state) => state[reducerKey],
  selectCurrentState: (state) => selectors.selectRoot(state).currentState,
};

const switchTimer = function*() {
  yield delay(6000);
  yield put(actions.timer());
};

const pedSwitchTimer = function*() {
  yield delay(2500);
  yield put(actions.pedTimer());
};

export const stateMachine: MachineDescription = {
  key: 'traffic-lights',
  // debug: true,
  setState: actions.setCurrentState,
  selectState: selectors.selectCurrentState,
  initial: states.GREEN,
  states: {
    [states.GREEN]: {
      activities: [switchTimer],
      on: {
        [actions.timer.type]: states.YELLOW,
      },
    },
    [states.YELLOW]: {
      activities: [switchTimer],
      on: {
        [actions.timer.type]: states.RED,
      },
    },
    [states.RED]: {
      activities: [switchTimer],
      on: {
        [actions.timer.type]: states.GREEN,
      },
      initial: states.WALK,
      states: {
        [states.WALK]: {
          activities: [pedSwitchTimer],
          on: {
            [actions.pedTimer.type]: states.WAIT,
          },
        },
        [states.WAIT]: {
          activities: [pedSwitchTimer],
          on: {
            [actions.pedTimer.type]: states.STOP,
          },
        },
        [states.STOP]: {},
      },
    },
  },
};
