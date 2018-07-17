import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { createStateMachineSaga } from 'redux-saga-state-machine';

const states = {
  APP: 'APP',
  PLAYING: 'PLAYING',
  SWITCHING: 'SWITCHING',
};

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
};

const reducer = (state = initialState, action: any) => {
  if (action.type === 'SET_CURRENT_STATE') {
    return {
      ...state,
      currentState: action.payload.state,
    };
  }
  return state;
};

const selectCurrentState = (state: any) => state.currentState;

const helloSaga = createStateMachineSaga({
  key: 'example-state-machine',
  setState: setCurrentState,
  selectState: selectCurrentState,
  states: {
    [states.APP]: {
      on: {
        ['PLAY']: states.PLAYING,
      },
    },
    [states.PLAYING]: {
      on: {
        ['STOP']: states.APP,
        ['NEXT']: states.SWITCHING,
      },
    },
    [states.SWITCHING]: {
      on: {
        ['STOP']: states.APP,
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
  onPlay,
  onStop,
  onNext,
}: {
  currentState: string;
  onPlay: any;
  onStop: any;
  onNext: any;
}) => {
  return (
    <div>
      <h1>Redux Saga State Machine Example</h1>

      <div>Current State: {currentState}</div>

      <div>
        <button onClick={onPlay}>Play</button>
        <button onClick={onStop}>Stop</button>
        <button onClick={onNext}>Next</button>
      </div>
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    currentState: selectCurrentState(state),
  };
};

const mapDispatchToProps = {
  onPlay: play,
  onStop: stop,
  onNext: next,
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
