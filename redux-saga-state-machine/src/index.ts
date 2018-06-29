import { Machine } from 'xstate';

export const createStateMachineSaga = (description) => {
  // tslint:disable-next-line:no-console
  console.log('createStateMachineSaga');

  const machine = Machine(description);

  return function*() {
    // tslint:disable-next-line:no-console
    console.log('running saga');
  };
};
