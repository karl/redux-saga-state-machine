import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { createStateMachineSaga } from 'redux-saga-state-machine';

const initialState = {
  test: 'yes this is a test',
};

const reducer = (state = initialState, action) => {
  if (action.type === 'DO_SOMETHING') {
    return {
      ...state,
      doSomething: true,
    };
  }
  return state;
};

const helloSaga = createStateMachineSaga({
  key: 'example-state-machine',
});

const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(helloSaga);

// const action = type => store.dispatch({ type });

const title = 'My Minimal React Webpack Babel Setup';

ReactDOM.render(
  <Provider store={store}>
    <div>{title}</div>
  </Provider>,
  document.getElementById('app'),
);

if (module.hot) {
  module.hot.accept();
}
