import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { createStateMachineSaga } from 'redux-saga-state-machine';
import { put } from 'redux-saga/effects';

const states = {
  APP: 'APP',
  PLAYING: 'PLAYING',
  SWITCHING: 'SWITCHING',
};

// Saga actions
const play = () => {
  return {
    type: 'PLAY',
  };
};
const stop = () => {
  return {
    type: 'STOP',
  };
};
const next = () => {
  return {
    type: 'NEXT',
  };
};
const error = () => {
  return {
    type: 'ERROR',
  };
};

// Reducer actions
const reset = () => {
  return {
    type: 'RESET',
  };
};
const setCurrentState = (state: string) => {
  return {
    type: 'SET_CURRENT_STATE',
    payload: {
      state,
    },
  };
};

const initialState = {
  currentState: states.APP,
  numPlayed: 0,
};

const reducer = (state = initialState, action: any) => {
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

const selectCurrentState = (state: any) => state.currentState;
const selectNumPlayed = (state: any) => state.numPlayed;

// const condRunner = (cond: () => SagaIterator) => ({
//   fullState,
// }: {
//   fullState: any;
// }) => {
//   const iterator = cond();
//   let result = iterator.next();
//   while (!result.done) {
//     const effect: any = result.value;
//     if (!effect.SELECT) {
//       throw new Error('You can only yield select from a conditional');
//     }
//     // tslint:disable-next-line:no-console
//     console.log(effect);
//     result = iterator.next(
//       effect.SELECT.selector(fullState, ...effect.SELECT.args),
//     );
//   }

//   return result.value;
// };

const onEntryApp = function*() {
  // tslint:disable-next-line:no-console
  console.log('onEntryApp!');
  yield put(reset());
};

const isNext = ({ fullState }: { fullState: any }) => {
  const numPlayed = selectNumPlayed(fullState);
  // tslint:disable-next-line:no-console
  console.log('numPlayed', numPlayed, numPlayed < 5);
  return numPlayed < 5;
};

const helloSaga = createStateMachineSaga({
  key: 'example-state-machine',
  debug: true,
  setState: setCurrentState,
  selectState: selectCurrentState,
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
      on: {
        ['STOP']: states.APP,
        ['ERROR']: states.APP,
        ['PLAY']: states.PLAYING,
      },
    },
  },
});

const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(helloSaga);

const App = ({
  currentState,
  numPlayed,
  onPlay,
  onStop,
  onNext,
  onError,
}: {
  currentState: string;
  numPlayed: number;
  onPlay: any;
  onStop: any;
  onNext: any;
  onError: any;
}) => {
  return (
    <div>
      <h1>Redux Saga State Machine Example</h1>

      <div>Current State: {currentState}</div>
      <div>Num played: {numPlayed}</div>

      <div>
        <button onClick={onPlay}>Play</button>
        <button onClick={onStop}>Stop</button>
        <button onClick={onNext}>Next</button>
        <button onClick={onError}>Error</button>
      </div>
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    currentState: selectCurrentState(state),
    numPlayed: selectNumPlayed(state),
  };
};

const mapDispatchToProps = {
  onPlay: play,
  onStop: stop,
  onNext: next,
  onError: error,
};

const ConnectedApp: any = connect(
  mapStateToProps,
  mapDispatchToProps,
)(App);

ReactDOM.render(
  <Provider store={store}>
    <ConnectedApp />
  </Provider>,
  document.getElementById('app'),
);

if (module.hot) {
  module.hot.accept();
}
