# Example (ish)

```js
import { Machine } from 'xstate';
import { MachineConfig, StateValue } from 'xstate/lib/types';

interface MachineDescription {
  key: string;
  selector: (reduxStoreState: any) => StateValue; // a redux selector
  setStateActionCreator: (newState: StateValue) => any; // a redux action creator
}

export const createStateMachineSaga = (description: MachineDescription) => {
  // tslint:disable-next-line:no-console
  console.log('createStateMachineSaga', description);

  const config: MachineConfig = {
    key: 'traffic-lights',
  };

  const machine = Machine(config);

  // const event = { type: 'TIMER' };
  // const newState = machine.transition('green', event);

  // newState === 'yellow'

  // const state = {
  //   red: {
  //     bicycleGreen: {},
  //     pedestrianGreen: {},
  //   },
  // };

  return function*(): IterableIterator<void> {
    // tslint:disable-next-line:no-console
    console.log('running saga', machine);

    const getState = () => { // return redux store state };

    while (true) {
      // get state
      const state = yield select(selectState);

      const event = take(machine.events);

      // wait for Redux action (event)
      const result = machine.transition(state, event, { getState });

      // result.actions
      // action = { type: 'xstate.start', activity: 'beep' };
      func = actionsMap.beep
      activities.beep = yield fork(func());

      // action = { type: 'xstate.stop', activity: 'beep' };
      yield cancel(activities.beep);

      result.actions.map();

      // set state
      // if (state !== newState) {
      yield put(setStateActionCreator(result.value));
      // }

      // yield put({ type: 'asdfg', payload: { stateMachineState: newState } });
    }
  };
};

const beep = function*() {
  const volume = yield select(volume);
  delay(500);
  yield put(makeNoise());
};

const isPoliceComing = (event, { getState }) => {
  const monkeys = selectMonkeys(getState());
  return event.type === 'POLICE_TIMER';
};

const description = {
  key: 'traffic-lights',
  selector: (state) => state.stateMachineState,
  setStateActionCreator: (newState) => ({
    type: 'SET_STATE',
    payload: newState,
  }),
  states: {
    red: {},
    yellow: {},
    green: {
      onEntry: beep,
      onExit: loudBeep,
      activities: beep,
      on: {
        TIMER: [
          { target: 'red', cond: isPoliceComing },
          { target: 'yellow', action: flashLights },
        ],
      },
    },
  },
};

const stateMachineSaga = createStateMachineSaga(description);
const svg = xStateToSVG(stateMachineSaga.toXState())

const reducer = (state, action) => {
  if (action.type === 'SET_STATE') {
    return {
      stateMachineState: action.stateMachineState,
    };
  }
};


const playing = function*() {
  takeLatest(START_PLAYING)

  const result = yield race(
    fetch('...'),
    CLOSE,
    ERROR,
  )

  if (result === CLOSE) { ... }

  put(nextEpisode(...))
}
// playing episode
// get next episode
// show next episode button


// click the button
// switch to next episode
yield put(STOP_PLAYBACK)
yield race(
  take(PLAYBACK_STOPPED),
  timeout,
  CLOSE,
  ERROR
)

yield put(START_PLAYBACK)
```
