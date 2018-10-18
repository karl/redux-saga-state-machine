import { delay } from 'redux-saga';
import { put } from 'redux-saga/effects';

export const reducerKey = 'player';

export const states = {
  APP: 'APP',
  PLAYER: 'PLAYER',
  SWITCHING: 'SWITCHING',

  PLAYBACK: 'PLAYBACK',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',

  CONFIRM: 'CONFIRM',
  CONFIRM_HIDDEN: 'CONFIRM_HIDDEN',
  CONFIRM_VISIBLE: 'CONFIRM_VISIBLE',
};

const constants = {
  SHOW_PLAYER: reducerKey + '/SHOW_PLAYER',
  STOP: reducerKey + '/STOP',
  PLAY: reducerKey + '/PLAY',
  PAUSE: reducerKey + '/PAUSE',
  SHOW_CONFIRM: reducerKey + '/SHOW_CONFIRM',
  HIDE_CONFIRM: reducerKey + '/HIDE_CONFIRM',
  NEXT: reducerKey + '/NEXT',
  ERROR: reducerKey + '/ERROR',
  RESET: reducerKey + '/RESET',
  SET_CURRENT_STATE: reducerKey + '/SET_CURRENT_STATE',
};

export const actions = {
  showPlayer: () => {
    return {
      type: constants.SHOW_PLAYER,
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
  play: () => {
    return {
      type: constants.PLAY,
    };
  },
  pause: () => {
    return {
      type: constants.PAUSE,
    };
  },
  showConfirm: () => {
    return {
      type: constants.SHOW_CONFIRM,
    };
  },
  hideConfirm: () => {
    return {
      type: constants.HIDE_CONFIRM,
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
  if (action.type === constants.SHOW_PLAYER) {
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

const matchState = (state, ...statesArray) => {
  if (statesArray.length === 0) {
    return true;
  }

  const [nextState, ...rest] = statesArray;
  if (state === nextState) {
    return true;
  }

  if (state[nextState]) {
    return matchState(state[nextState], ...rest);
  }

  return false;
};

export const selectors = {
  selectRoot: (state: any) => state[reducerKey],
  selectCurrentState: (state: any) => selectors.selectRoot(state).currentState,
  selectNumPlayed: (state: any) => selectors.selectRoot(state).numPlayed,
  isInApp: (state) =>
    matchState(selectors.selectCurrentState(state), states.APP),
  isInPlayer: (state) =>
    matchState(selectors.selectCurrentState(state), states.PLAYER),
  isSwitching: (state) =>
    matchState(selectors.selectCurrentState(state), states.SWITCHING),
  isPlaying: (state) =>
    matchState(
      selectors.selectCurrentState(state),
      states.PLAYER,
      states.PLAYBACK,
      states.PLAYING,
    ),
  isConfirmVisible: (state) =>
    matchState(
      selectors.selectCurrentState(state),
      states.PLAYER,
      states.CONFIRM,
      states.CONFIRM_VISIBLE,
    ),
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

const doSwitch = function*() {
  yield delay(1000);
  yield put(actions.showPlayer());
};

const startPlayback = function*(action: any): any {
  // tslint:disable-next-line:no-console
  console.log('Start playback with action', action);
};

const exitConfirm = () => {
  // tslint:disable-next-line:no-console
  console.log('Hide confirm modal');
};

export const stateMachine = {
  key: 'player',
  // debug: true,
  setState: actions.setCurrentState,
  selectState: selectors.selectCurrentState,
  initial: states.APP,
  states: {
    [states.APP]: {
      onEntry: [onEntryApp],
      on: {
        [constants.SHOW_PLAYER]: states.PLAYER,
      },
    },
    [states.PLAYER]: {
      activities: [startPlayback],
      on: {
        [constants.STOP]: states.APP,
        [constants.ERROR]: states.APP,
        [constants.NEXT]: [
          { target: states.SWITCHING, cond: isNext },
          { target: states.APP },
        ],
      },
      parallel: true,
      states: {
        [states.PLAYBACK]: {
          initial: states.PLAYING,
          states: {
            [states.PLAYING]: {
              on: {
                [constants.PAUSE]: states.PAUSED,
              },
            },
            [states.PAUSED]: {
              on: {
                [constants.PLAY]: states.PLAYING,
              },
            },
          },
        },
        [states.CONFIRM]: {
          initial: states.CONFIRM_HIDDEN,
          onExit: [exitConfirm],
          states: {
            [states.CONFIRM_HIDDEN]: {
              on: {
                [constants.SHOW_CONFIRM]: states.CONFIRM_VISIBLE,
              },
            },
            [states.CONFIRM_VISIBLE]: {
              on: {
                [constants.HIDE_CONFIRM]: states.CONFIRM_HIDDEN,
              },
            },
          },
        },
      },
    },
    [states.SWITCHING]: {
      activities: [doSwitch],
      on: {
        [constants.STOP]: [{ target: states.APP, actions: [doStop] }],
        [constants.ERROR]: states.APP,
        [constants.SHOW_PLAYER]: states.PLAYER,
      },
    },
  },
};
