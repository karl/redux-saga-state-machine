import * as redux from 'redux';
import { SagaIterator } from 'redux-saga';
import * as xstate from 'xstate/lib/types';
export type StateValue = xstate.StateValue;

export type GetState = () => any;

export type SetStateActionCreator = (state: StateValue) => redux.Action;

export type ReduxInterface = {
  getState: GetState;
  dispatch: redux.Dispatch;
};

export type Action = (
  reduxInterface: ReduxInterface,
  event: redux.Action,
) => void;
export type Condition = (
  reduxInterface: ReduxInterface,
  event: redux.Action,
) => boolean;
export type Activity = (event: redux.Action) => IterableIterator<any>;

export type Transition = {
  target: string;
  cond?: Condition;
  actions?: Action[];
  internal?: boolean;
};

export type Transitions = string | Transition[];

export type StateNode = {
  onEntry?: Action[];
  onExit?: Action[];
  activities?: Activity[];
  on?: Record<string, Transitions>;
  initial?: string;
  parallel?: boolean;
  states?: Record<string, StateNode>;
};

export type MachineDescription = {
  key: string;
  debug?: boolean;
  setState: SetStateActionCreator;
  selectState: (state: any) => StateValue;
  initial: string;
  states: Record<string, StateNode>;
};

export type ActionsMap = Record<string, Action | Activity>;

export type SagaFunction = (reduxInterface: ReduxInterface) => SagaIterator;
