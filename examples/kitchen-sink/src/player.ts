import { delay } from 'redux-saga';
import { matchState } from 'redux-saga-state-machine';
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
  START_PLAYBACK: reducerKey + '/START_PLAYBACK',
  CLOSE_PLAYER: reducerKey + '/CLOSE_PLAYER',
  PLAY: reducerKey + '/PLAY',
  PAUSE: reducerKey + '/PAUSE',
  SHOW_CONFIRM: reducerKey + '/SHOW_CONFIRM',
  HIDE_CONFIRM: reducerKey + '/HIDE_CONFIRM',
  NEXT: reducerKey + '/NEXT',
  ERROR: reducerKey + '/ERROR',
  SHOW_NOTIFICATION: reducerKey + '/SHOW_NOTIFICATION',
  HIDE_NOTIFICATION: reducerKey + '/HIDE_NOTIFICATION',
  RESET: reducerKey + '/RESET',
  SET_CURRENT_STATE: reducerKey + '/SET_CURRENT_STATE',
};

export const actions = {
  startPlayback: () => {
    return {
      type: constants.START_PLAYBACK,
    };
  },
  closePlayer: () => {
    return {
      type: constants.CLOSE_PLAYER,
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

  showNotification: (message) => {
    return {
      type: constants.SHOW_NOTIFICATION,
      payload: {
        message,
      },
    };
  },
  hideNotification: () => {
    return {
      type: constants.HIDE_NOTIFICATION,
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
  notificationVisible: false,
  notificationMessage: '',
};

export const reducer = (state = initialState, action: any) => {
  if (action.type === constants.SET_CURRENT_STATE) {
    return {
      ...state,
      currentState: action.payload.state,
    };
  }
  if (action.type === constants.START_PLAYBACK) {
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
  if (action.type === constants.SHOW_NOTIFICATION) {
    return {
      ...state,
      notificationVisible: true,
      notificationMessage: action.payload.message,
    };
  }
  if (action.type === constants.HIDE_NOTIFICATION) {
    return {
      ...state,
      notificationVisible: false,
      notificationMessage: '',
    };
  }
  return state;
};

export const selectors = {
  selectRoot: (state: any) => state[reducerKey],
  selectCurrentState: (state: any) => selectors.selectRoot(state).currentState,
  selectNumPlayed: (state: any) => selectors.selectRoot(state).numPlayed,
  isNotificationVisible: (state) =>
    selectors.selectRoot(state).notificationVisible,
  notificationMessage: (state) =>
    selectors.selectRoot(state).notificationMessage,

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

const showErrorNotification = ({ dispatch }) => {
  dispatch(actions.showNotification('Player error'));
};

const doCloseFromSwitching = () => {
  // tslint:disable-next-line:no-console
  console.log('doCloseFromSwitching');
};

const doSwitch = function*() {
  yield delay(1000);
  yield put(actions.startPlayback());
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
        [constants.START_PLAYBACK]: states.PLAYER,
      },
    },
    [states.PLAYER]: {
      activities: [startPlayback],
      on: {
        [constants.CLOSE_PLAYER]: states.APP,
        [constants.ERROR]: [
          {
            target: states.APP,
            actions: [showErrorNotification],
          },
        ],
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
        [constants.CLOSE_PLAYER]: [
          { target: states.APP, actions: [doCloseFromSwitching] },
        ],
        [constants.ERROR]: [
          {
            target: states.APP,
            actions: [showErrorNotification],
          },
        ],
        [constants.START_PLAYBACK]: states.PLAYER,
      },
    },
  },
};
