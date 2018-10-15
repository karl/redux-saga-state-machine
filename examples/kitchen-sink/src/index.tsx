import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { createStateMachineSaga } from 'redux-saga-state-machine';
import { emit } from './kukerEmitter';
import * as player from './player';
import { ConnectedPlayer } from './PlayerUI';
import * as trafficLights from './trafficLights';
import { ConnectedTrafficLights } from './TrafficLightsUI';

const kukerAndConsoleEmit = (emitted) => {
  emit(emitted);
  const { key, type, label, ...details } = emitted;
  // tslint:disable-next-line no-console
  console.log(key, label, details);
};

const playerSaga = createStateMachineSaga(player.stateMachine, {
  emit: kukerAndConsoleEmit,
});
const trafficLightsSaga = createStateMachineSaga(trafficLights.stateMachine, {
  emit: kukerAndConsoleEmit,
});

const sagaMiddleware = createSagaMiddleware();

const reducer = combineReducers({
  [player.reducerKey]: player.reducer,
  [trafficLights.reducerKey]: trafficLights.reducer,
});

const store = createStore(reducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(playerSaga, {
  getState: store.getState,
  dispatch: store.dispatch,
});
sagaMiddleware.run(trafficLightsSaga, {
  getState: store.getState,
  dispatch: store.dispatch,
});

const Header = () => {
  return (
    <React.Fragment>
      <h1 className="header">Redux Saga State Machine Example</h1>
      {!location.hostname.endsWith('.codesandbox.io') && (
        <a href="https://codesandbox.io/s/github/karl/redux-saga-state-machine/tree/master/examples/kitchen-sink">
          Edit on Code Sandbox
        </a>
      )}
    </React.Fragment>
  );
};

ReactDOM.render(
  <Provider store={store}>
    <div className="app">
      <Header />
      <ConnectedPlayer />
      <ConnectedTrafficLights />
    </div>
  </Provider>,
  document.getElementById('app'),
);
