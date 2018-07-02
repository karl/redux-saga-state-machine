import { xstateToSvg } from './index';

describe('xstateToSvg', () => {
  it('simple', () => {
    const description = {
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
    expect(xstateToSvg(description)).toMatchSnapshot();
  });

  // it('guards', () => {
  //   const description = {
  //     id: 'guards',
  //     initial: 'closed',
  //     states: {
  //       closed: {
  //         initial: 'idle',
  //         states: {
  //           idle: {},
  //           error: {},
  //         },
  //         on: {
  //           OPEN: [
  //             { target: 'opened', cond: (extState) => extState.isAdmin },
  //             { target: 'closed.error' },
  //           ],
  //         },
  //       },
  //       opened: {
  //         on: {
  //           CLOSE: 'closed',
  //         },
  //       },
  //     },
  //   };
  //   expect(xstateToSvg(description)).toMatchSnapshot();
  // });
});
