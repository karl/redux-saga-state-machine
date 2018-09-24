module.exports = {
  key: 'video-app',
  initial: 'home',
  states: {
    home: {
      onEntry: [{ type: 'getContent' }],
      on: {
        PLAY: 'player',
      },
    },
    player: {
      onEntry: [{ type: 'trackPlay' }, { type: 'getNextEpisode' }],
      on: {
        CLOSE: 'home',
      },
    },
  },
};
