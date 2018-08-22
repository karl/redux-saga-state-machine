import { delay } from 'redux-saga';
import { put } from 'redux-saga/effects';

export const reducerKey = 'player';

export const states = {
  APP: 'APP',
  PLAYING: 'PLAYING',
  SWITCHING: 'SWITCHING',
};

const constants = {
  PLAY: reducerKey + '/PLAY',
  STOP: reducerKey + '/STOP',
  NEXT: reducerKey + '/NEXT',
  ERROR: reducerKey + '/ERROR',
  RESET: reducerKey + '/RESET',
  SET_CURRENT_STATE: reducerKey + '/SET_CURRENT_STATE',
};

export const actions = {
  play: () => {
    return {
      type: constants.PLAY,
    };
  },
  stop: () => {
    return {
      type: constants.STOP,
    };
  },
  next: () => {
    return {
      type: constants.NEXT,
    };
  },
  error: () => {
    return {
      type: constants.ERROR,
    };
  },

  reset: () => {
    return {
      type: constants.RESET,
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
  numPlayed: 0,
};

export const reducer = (state = initialState, action: any) => {
  if (action.type === constants.SET_CURRENT_STATE) {
    return {
      ...state,
      currentState: action.payload.state,
    };
  }
  if (action.type === constants.PLAY) {
    return {
      ...state,
      numPlayed: state.numPlayed + 1,
    };
  }
  if (action.type === constants.RESET) {
    return {
      ...state,
      numPlayed: 0,
    };
  }
  return state;
};

export const selectors = {
  selectRoot: (state: any) => state[reducerKey],
  selectCurrentState: (state: any) => selectors.selectRoot(state).currentState,
  selectNumPlayed: (state: any) => selectors.selectRoot(state).numPlayed,
};

const onEntryApp = ({ dispatch }: { dispatch: any }) => {
  dispatch(actions.reset());
};

const isNext = ({ getState }: { getState: any }) => {
  const numPlayed = selectors.selectNumPlayed(getState());
  return numPlayed < 5;
};

const doStop = () => {
  // tslint:disable-next-line:no-console
  console.log('doStop');
};

const switchTimeout = function*() {
  yield delay(10000);
  yield put(actions.error());
};

export const stateMachine = {
  key: 'player',
  debug: true,
  setState: actions.setCurrentState,
  selectState: selectors.selectCurrentState,
  initial: states.APP,
  states: {
    [states.APP]: {
      onEntry: onEntryApp,
      on: {
        [constants.PLAY]: states.PLAYING,
      },
    },
    [states.PLAYING]: {
      on: {
        [constants.STOP]: states.APP,
        [constants.ERROR]: states.APP,
        [constants.NEXT]: [
          { target: states.SWITCHING, cond: isNext },
          { target: states.APP },
        ],
      },
    },
    [states.SWITCHING]: {
      activities: [switchTimeout],
      on: {
        [constants.STOP]: [{ target: states.APP, actions: [doStop] }],
        [constants.ERROR]: states.APP,
        [constants.PLAY]: states.PLAYING,
      },
    },
  },
};
