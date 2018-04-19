'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var xstate = require('xstate');

const createStateMachineSaga = () => {
  console.log('createStateMachineSaga');

  const machine = xstate.Machine({
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

exports.createStateMachineSaga = createStateMachineSaga;
