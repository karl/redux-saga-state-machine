import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { createStateMachineSaga } from 'redux-saga-state-machine';

const setStateMachineState = stateMachineState => {
  return { type: 'SET_STATE', payload: stateMachineState };
};
const press = () => {
  return { type: 'PRESS' };
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_STATE':
      return {
        ...state,
        stateMachineState: action.payload,
      };
    default:
      return state;
  }
};

const saga = createStateMachineSaga({
  initial: 'CLOSED',
  setState: setStateMachineState,
  states: {
    CLOSED: {
      on: {
        PRESS: 'OPEN',
      },
    },
    OPEN: {
      on: {
        PRESS: 'CLOSED',
      },
    },
  },
});

const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(saga, {
  getState: store.getState,
  dispatch: store.dispatch,
});

console.log(store.getState().stateMachineState);
// 'CLOSED'

store.dispatch(press());
console.log(store.getState().stateMachineState);
// 'OPEN'

store.dispatch(press());
console.log(store.getState().stateMachineState);
// 'CLOSED'
