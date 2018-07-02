import { xstateToSvg } from './index';

describe('xstateToSvg', () => {
  it('...', () => {
    const description = {
      id: 'guards',
      initial: 'closed',
      states: {
        closed: {
          initial: 'idle',
          states: {
            idle: {},
            error: {},
          },
          on: {
            OPEN: [
              { target: 'opened', cond: (extState) => extState.isAdmin },
              { target: 'closed.error' },
            ],
          },
        },
        opened: {
          on: {
            CLOSE: 'closed',
          },
        },
      },
    };
    expect(xstateToSvg(description)).toMatchSnapshot();
  });
});
