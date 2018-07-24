import * as color from 'color';
import * as ColorHash from 'color-hash';
import { BaseEmitter } from 'kuker-emitters';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { createStateMachineSaga } from 'redux-saga-state-machine';
import { actions, reducer, selectors, stateMachine } from './logic';

const kukerEmit = BaseEmitter();
const colorHash = new ColorHash();
const typeToIconMap: { [index: string]: string } = {
  STATE_MACHINE_START: 'fa-play-circle',
  STATE_MACHINE_INITIAL_STATE: 'fa-archive',
  STATE_MACHINE_LISTENING: 'fa-ellipsis-h',
  STATE_MACHINE_RECEIVED: 'fa-arrow-left',
  STATE_MACHINE_NO_TRANSITION: 'fa-ban',
  STATE_MACHINE_NEW_STATE: 'fa-archive',
  STATE_MACHINE_START_ACTIVITY: 'fa-play',
  STATE_MACHINE_STOP_ACTIVITY: 'fa-stop',
  STATE_MACHINE_ACTION: 'fa-circle',
};

const emit = (emitted: any) => {
  kukerEmit({
    ...emitted,
    icon: typeToIconMap[emitted.type],
    color: color(colorHash.hex(emitted.key))
      .lighten(0.7)
      .hex(),
  });
};

const helloSaga = createStateMachineSaga(stateMachine, { emit });

const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(helloSaga, {
  getState: store.getState,
  dispatch: store.dispatch,
});

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
    currentState: selectors.selectCurrentState(state),
    numPlayed: selectors.selectNumPlayed(state),
  };
};

const mapDispatchToProps = {
  onPlay: actions.play,
  onStop: actions.stop,
  onNext: actions.next,
  onError: actions.error,
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
