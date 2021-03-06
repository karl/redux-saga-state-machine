module.exports = {
  key: 'light',
  initial: 'green',
  states: {
    green: {
      on: {
        TIMER: 'yellow',
        POWER_OUTAGE: 'red',
      },
    },
    yellow: {
      on: {
        TIMER: 'red',
        POWER_OUTAGE: 'red',
      },
    },
    red: {
      on: {
        TIMER: 'green',
        POWER_OUTAGE: 'red',
      },
    },
  },
};
