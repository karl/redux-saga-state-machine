import { Machine } from 'xstate';
import { MachineConfig } from 'xstate/lib/types';

interface IMachineDescription {
  key: string;
}

export const createStateMachineSaga = (description: IMachineDescription) => {
  // tslint:disable-next-line:no-console
  console.log('createStateMachineSaga');

  const config: MachineConfig = {
    states: {},
  };

  const machine = Machine(config);

  return function*() {
    // tslint:disable-next-line:no-console
    console.log('running saga');
  };
};
