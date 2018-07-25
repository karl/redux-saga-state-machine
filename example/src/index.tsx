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

const playerSaga = createStateMachineSaga(player.stateMachine, { emit });
const trafficLightsSaga = createStateMachineSaga(trafficLights.stateMachine, {
  emit,
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
  return <h1>Redux Saga State Machine Example</h1>;
};

ReactDOM.render(
  <Provider store={store}>
    <div>
      <Header />
      <ConnectedPlayer />
      <ConnectedTrafficLights />
    </div>
  </Provider>,
  document.getElementById('app'),
);

if (module.hot) {
  module.hot.accept();
}
