import * as fs from 'fs';
import * as lolex from 'lolex';
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
} from './player';

describe('state machine', () => {
  it('generate visualisation', () => {
    const svg = xstateToSvg(stateMachine);
    fs.writeFileSync(path.resolve(__dirname, 'player.svg'), svg, {
      encoding: 'utf8',
    });
  });

  describe('saga', () => {
    let clock;
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
        undefined,
        applyMiddleware(sagaMiddleware),
      );

      const saga = createStateMachineSaga(stateMachine);

      sagaMiddleware.run(saga, {
        getState: store.getState,
        dispatch: store.dispatch,
      });

      store.dispatch(actions.play());

      expect(selectors.selectCurrentState(store.getState())).toEqual(
        states.PLAYING,
      );

      store.dispatch(actions.stop());

      expect(selectors.selectCurrentState(store.getState())).toEqual(
        states.APP,
      );
    });
  });
});
