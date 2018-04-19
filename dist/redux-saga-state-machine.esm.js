import { Machine } from 'xstate';

const createStateMachineSaga = () => {
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

export { createStateMachineSaga };
