module.exports = {
  key: 'example',
  initial: 'app',
  states: {
    app: {
      onEntry: ['start'],
      activities: ['doA', 'doB'],
      onExit: ['finish'],
      on: {
        PLAY: 'player',
      },
    },
    player: {},
  },
};
