module.exports = {
  key: 'light',
  initial: 'green',
  states: {
    green: {
      on: {
        TIMER: 'yellow',
      },
    },
    yellow: {
      on: {
        TIMER: 'red',
      },
    },
    red: {
      on: {
        TIMER: 'green',
      },
      initial: 'walk',
      states: {
        walk: {
          on: {
            PED_TIMER: 'wait',
          },
        },
        wait: {
          on: {
            PED_TIMER: 'stop',
          },
        },
        stop: {},
      },
    },
  },
};
