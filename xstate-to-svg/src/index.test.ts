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

  // it('nested', () => {
  //   const pedestrianStates = {
  //     initial: 'walk',
  //     states: {
  //       walk: {
  //         on: {
  //           PED_TIMER: 'wait',
  //         },
  //       },
  //       wait: {
  //         on: {
  //           PED_TIMER: 'stop',
  //         },
  //       },
  //       stop: {},
  //     },
  //   };

  //   const nested = {
  //     key: 'light',
  //     initial: 'green',
  //     states: {
  //       green: {
  //         on: {
  //           TIMER: 'yellow',
  //         },
  //       },
  //       yellow: {
  //         on: {
  //           TIMER: 'red',
  //         },
  //       },
  //       red: {
  //         on: {
  //           TIMER: 'green',
  //         },
  //         ...pedestrianStates,
  //       },
  //     },
  //   };
  //   expect(xstateToSvg(nested)).toMatchSnapshot();
  // });
});
