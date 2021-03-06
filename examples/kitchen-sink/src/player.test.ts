import * as fs from 'fs';
import * as lolex from 'lolex';
import * as path from 'path';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import {
  createStateMachineSaga,
  toXstateConfig,
} from 'redux-saga-state-machine';
import { xstateToSvg } from 'xstate-to-svg';
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
    const { xstateConfig } = toXstateConfig(stateMachine);
    const svg = xstateToSvg(xstateConfig);
    fs.writeFileSync(path.resolve(__dirname, 'player.svg'), svg, {
      encoding: 'utf8',
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

      store.dispatch(actions.startPlayback());

      expect(selectors.selectCurrentState(store.getState())).toEqual({
        PLAYER: { CONFIRM: 'CONFIRM_HIDDEN', PLAYBACK: 'PLAYING' },
      });

      store.dispatch(actions.closePlayer());

      expect(selectors.selectCurrentState(store.getState())).toEqual(
        states.APP,
      );
    });
  });
});
