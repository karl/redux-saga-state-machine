import * as fs from 'fs';
import * as path from 'path';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { createStateMachineSaga } from 'redux-saga-state-machine';
import { xstateToSvg } from '../../xstate-to-svg/dist';
import {
  actions,
  reducer,
  reducerKey,
  selectors,
  stateMachine,
  states,
} from './trafficLights';

const wait = (duration) =>
  new Promise((resolve) => setTimeout(() => resolve(), duration));

describe('state machine', () => {
  it('generate visualisation', () => {
    const svg = xstateToSvg(stateMachine);
    fs.writeFileSync(path.resolve(__dirname, 'trafficLights.svg'), svg, {
      encoding: 'utf8',
    });
  });

  it(
    'runs saga',
    async () => {
      const sagaMiddleware = createSagaMiddleware();
      const store = createStore(
        combineReducers({ [reducerKey]: reducer }),
        undefined,
        applyMiddleware(sagaMiddleware),
      );

      const saga = createStateMachineSaga(stateMachine);

      sagaMiddleware.run(saga, {
        getState: store.getState,
        dispatch: store.dispatch,
      });

      expect(selectors.selectCurrentState(store.getState())).toEqual(
        states.GREEN,
      );

      // We should really be using a mock timer so we can run this test instantly
      await wait(6000);
      expect(selectors.selectCurrentState(store.getState())).toEqual(
        states.YELLOW,
      );
    },
    7000,
  );
});
