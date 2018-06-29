import 'regenerator-runtime/runtime'
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { reducer } from './reducer';
import { stateMachineSaga, anotherSaga } from './state-machine-saga';

const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducer, applyMiddleware(sagaMiddleware));
sagaMiddleware.run(stateMachineSaga);
sagaMiddleware.run(anotherSaga);

const action = type => store.dispatch({type});

action('TEST')

ReactDOM.render(<App />, document.getElementById('root'));
