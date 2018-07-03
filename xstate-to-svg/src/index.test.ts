import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import { xstateToSvg } from './index';

const fixtures = [
  {
    name: 'simple',
    description: {
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
    },
  },
  {
    name: 'nested',
    description: {
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
    },
  },
];

describe('xstateToSvg', () => {
  fixtures.forEach((fixture) => {
    it(fixture.name, () => {
      const svg = xstateToSvg(fixture.description);

      mkdirp.sync(__dirname + '/images');
      fs.writeFileSync(__dirname + '/images/' + fixture.name + '.svg', svg);

      expect(svg).toMatchSnapshot();
    });
  });
});
