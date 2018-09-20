import * as fs from 'fs';
import * as lolex from 'lolex';
import * as path from 'path';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { createStateMachineSaga } from 'redux-saga-state-machine';
import { xstateToSvg } from '../../xstate-to-svg/dist';
import {
  reducer,
  reducerKey,
  selectors,
  stateMachine,
  states,
} from './trafficLights';

describe('state machine', () => {
  describe('visualisation', () => {
    it('generates svg', () => {
      // @ts-ignore
      const svg = xstateToSvg(stateMachine);
      fs.writeFileSync(path.resolve(__dirname, 'trafficLights.svg'), svg, {
        encoding: 'utf8',
      });
    });
  });

  describe('saga', () => {
    let clock: lolex.Clock;
    beforeEach(() => {
      clock = lolex.install();
    });

    afterEach(() => {
      clock.uninstall();
    });

    it('runs', () => {
      const sagaMiddleware = createSagaMiddleware();
      const store = createStore(
        combineReducers({ [reducerKey]: reducer }),
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

      clock.tick(6001);
      expect(selectors.selectCurrentState(store.getState())).toEqual(
        states.YELLOW,
      );

      clock.tick(6001);
      expect(selectors.selectCurrentState(store.getState())).toEqual({
        [states.RED]: states.WALK,
      });

      clock.tick(2501);
      expect(selectors.selectCurrentState(store.getState())).toEqual({
        [states.RED]: states.WAIT,
      });

      clock.tick(6001 - 2501);
      expect(selectors.selectCurrentState(store.getState())).toEqual(
        states.GREEN,
      );
    });
  });
});
