import { Machine } from 'xstate';

export const createStateMachineSaga = () => {
  console.log('createStateMachineSaga');

  const machine = Machine({
    states: {
      green: {},
      yellow: {},
      red: {},
    },
  });

  return function*() {
    console.log('running saga');
  };
};
