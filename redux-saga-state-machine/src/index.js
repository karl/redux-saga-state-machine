import { Machine } from 'xstate';

export const createStateMachineSaga = (description) => {
  console.log('createStateMachineSaga');

  const machine = Machine(description);

  return function*() {
    console.log('running saga');
  };
};
