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
  {
    name: 'parallel',
    description: {
      parallel: true,
      states: {
        bold: {
          initial: 'off',
          states: {
            on: {
              on: { TOGGLE_BOLD: 'off' },
            },
            off: {
              on: { TOGGLE_BOLD: 'on' },
            },
          },
        },
        underline: {
          initial: 'off',
          states: {
            on: {
              on: { TOGGLE_UNDERLINE: 'off' },
            },
            off: {
              on: { TOGGLE_UNDERLINE: 'on' },
            },
          },
        },
        italics: {
          initial: 'off',
          states: {
            on: {
              on: { TOGGLE_ITALICS: 'off' },
            },
            off: {
              on: { TOGGLE_ITALICS: 'on' },
            },
          },
        },
        list: {
          initial: 'none',
          states: {
            none: {
              on: { BULLETS: 'bullets', NUMBERS: 'numbers' },
            },
            bullets: {
              on: { NONE: 'none', NUMBERS: 'numbers' },
            },
            numbers: {
              on: { BULLETS: 'bullets', NONE: 'none' },
            },
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
