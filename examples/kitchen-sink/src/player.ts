import { delay } from 'redux-saga';
import { matchState } from 'redux-saga-state-machine';
import { put } from 'redux-saga/effects';
import { createActions } from './createAction';

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

const createAction = createActions(reducerKey);
export const actions = {
  startPlayback: createAction('START_PLAYBACK'),
  closePlayer: createAction('CLOSE_PLAYER'),
  next: createAction('NEXT'),
  error: createAction('ERROR'),
  play: createAction('PLAY'),
  pause: createAction('PAUSE'),
  showConfirm: createAction('SHOW_CONFIRM'),
  hideConfirm: createAction('HIDE_CONFIRM'),
  showNotification: createAction('SHOW_NOTIFICATION'),
  hideNotification: createAction('HIDE_NOTIFICATION'),
  reset: createAction('RESET'),
  setCurrentState: createAction('SET_CURRENT_STATE'),
};

const initialState = {
  currentState: null,
  numPlayed: 0,
  notificationVisible: false,
  notificationMessage: '',
};

export const reducer = (state = initialState, { type, payload }: any) => {
  if (type === actions.setCurrentState.type) {
    return {
      ...state,
      currentState: payload,
    };
  }
  if (type === actions.startPlayback.type) {
    return {
      ...state,
      numPlayed: state.numPlayed + 1,
    };
  }
  if (type === actions.reset.type) {
    return {
      ...state,
      numPlayed: 0,
    };
  }
  if (type === actions.showNotification.type) {
    return {
      ...state,
      notificationVisible: true,
      notificationMessage: payload,
    };
  }
  if (type === actions.hideNotification.type) {
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
        [actions.startPlayback.type]: states.PLAYER,
      },
    },
    [states.PLAYER]: {
      activities: [startPlayback],
      on: {
        [actions.closePlayer.type]: states.APP,
        [actions.error.type]: [
          {
            target: states.APP,
            actions: [showErrorNotification],
          },
        ],
        [actions.next.type]: [
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
                [actions.pause.type]: states.PAUSED,
              },
            },
            [states.PAUSED]: {
              on: {
                [actions.play.type]: states.PLAYING,
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
                [actions.showConfirm.type]: states.CONFIRM_VISIBLE,
              },
            },
            [states.CONFIRM_VISIBLE]: {
              on: {
                [actions.hideConfirm.type]: states.CONFIRM_HIDDEN,
              },
            },
          },
        },
      },
    },
    [states.SWITCHING]: {
      activities: [doSwitch],
      on: {
        [actions.closePlayer.type]: [
          { target: states.APP, actions: [doCloseFromSwitching] },
        ],
        [actions.error.type]: [
          {
            target: states.APP,
            actions: [showErrorNotification],
          },
        ],
        [actions.startPlayback.type]: states.PLAYER,
      },
    },
  },
};
