# Redux Saga State Machine

**A work in progress**

Redux Saga based state machine runner.

## Example

https://redux-saga-state-machine.netlify.com

## Installing

```
yarn add redux-saga-state-machine
```

You'll also need to install the peer dependencies of Redux, Redux Saga, and xstate (if you haven't already)

```
yarn add redux redux-saga xstate
```

## Using

```js
import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { createStateMachineSaga } from 'redux-saga-state-machine';

const setStateMachineState = (stateMachineState) => {
  return { type: 'SET_STATE', payload: stateMachineState };
};
const press = () => {
  return { type: 'PRESS' };
};

const reducer = (state, action) => {
  switch (action.type) {
    case value:
      return {
        ...state,
        stateMachineState: action.payload,
      };
    default:
      return state;
  }
}

const saga = createStateMachineSaga({
  initial: 'CLOSED',
  setState: setStateMachineState,
  states: {
    CLOSED: {
      on: {
        'press': 'OPEN',
      },
    },
    OPEN: {
      on: {
        'press': 'CLOSED',
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

console.log(getState().stateMachineState);
// 'CLOSED'

dispatch(press());
console.log(getState().stateMachineState);
// 'OPEN'

dispatch(press());
console.log(getState().stateMachineState);
// 'CLOSED'

```
