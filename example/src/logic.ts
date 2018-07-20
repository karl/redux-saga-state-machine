import { delay } from 'redux-saga';
import { put } from 'redux-saga/effects';

const states = {
  APP: 'APP',
  PLAYING: 'PLAYING',
  SWITCHING: 'SWITCHING',
};

export const actions = {
  // Redux actions
  play: () => {
    return {
      type: 'PLAY',
    };
  },
  stop: () => {
    return {
      type: 'STOP',
    };
  },
  next: () => {
    return {
      type: 'NEXT',
    };
  },
  error: () => {
    return {
      type: 'ERROR',
    };
  },

  // Reducer actions
  reset: () => {
    return {
      type: 'RESET',
    };
  },
  setCurrentState: (state: string) => {
    return {
      type: 'SET_CURRENT_STATE',
      payload: {
        state,
      },
    };
  },
};

const initialState = {
  currentState: states.APP,
  numPlayed: 0,
};

export const reducer = (state = initialState, action: any) => {
  if (action.type === 'SET_CURRENT_STATE') {
    return {
      ...state,
      currentState: action.payload.state,
    };
  }
  if (action.type === 'PLAY') {
    return {
      ...state,
      numPlayed: state.numPlayed + 1,
    };
  }
  if (action.type === 'RESET') {
    return {
      ...state,
      numPlayed: 0,
    };
  }
  return state;
};

export const selectors = {
  selectCurrentState: (state: any) => state.currentState,
  selectNumPlayed: (state: any) => state.numPlayed,
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
  // tslint:disable-next-line:no-console
  console.log('switchTimeout');
  yield delay(10000);
  yield put(actions.error());
};

export const stateMachine = {
  key: 'example-state-machine',
  debug: true,
  setState: actions.setCurrentState,
  selectState: selectors.selectCurrentState,
  states: {
    [states.APP]: {
      onEntry: onEntryApp,
      on: {
        ['PLAY']: states.PLAYING,
      },
    },
    [states.PLAYING]: {
      on: {
        ['STOP']: states.APP,
        ['ERROR']: states.APP,
        ['NEXT']: [
          { target: states.SWITCHING, cond: isNext },
          { target: states.APP },
        ],
      },
    },
    [states.SWITCHING]: {
      activities: [switchTimeout],
      on: {
        ['STOP']: [{ target: states.APP, actions: [doStop] }],
        ['ERROR']: states.APP,
        ['PLAY']: states.PLAYING,
      },
    },
  },
};
