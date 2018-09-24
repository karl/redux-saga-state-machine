module.exports = {
  initial: 'closed',
  states: {
    closed: {
      on: {
        OPEN: [
          { target: 'opened', cond: 'isAdmin', actions: [{ type: 'track' }] },
          { target: 'stuck', cond: (extState) => extState.sticky },
          { target: 'closed' },
        ],
      },
    },
    opened: {
      on: {
        CLOSE: 'closed',
      },
    },
    stuck: {},
  },
};
