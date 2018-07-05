import { Machine } from 'xstate';
import { MachineConfig } from 'xstate/lib/types';

interface IMachineDescription {
  key: string;
}

export const createStateMachineSaga = (description: IMachineDescription) => {
  // tslint:disable-next-line:no-console
  console.log('createStateMachineSaga', description);

  const config: MachineConfig = {
    states: {},
  };

  const machine = Machine(config);

  return function*(): IterableIterator<void> {
    // tslint:disable-next-line:no-console
    console.log('running saga', machine);
  };
};
