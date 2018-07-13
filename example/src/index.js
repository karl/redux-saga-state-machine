import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import { createStateMachineSaga } from 'redux-saga-state-machine';

const initialState = {
  test: 'yes this is a test',
};

const reducer = (state = initialState, action) => {
  return state;
}

const helloSaga = createStateMachineSaga({
  key: 'example-state-machine',
});

const sagaMiddleware = createSagaMiddleware()
const store = createStore(
  reducer,
  applyMiddleware(sagaMiddleware)
)
sagaMiddleware.run(helloSaga)

const action = type => store.dispatch({type})


const title = 'My Minimal React Webpack Babel Setup';

ReactDOM.render(
  <div>{title}</div>,
  document.getElementById('app')
);

module.hot.accept();
