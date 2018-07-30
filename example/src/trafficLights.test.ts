import * as fs from 'fs';
import * as path from 'path';
import { xstateToSvg } from '../../xstate-to-svg/dist';
import { stateMachine } from './trafficLights';

describe('state machine', () => {
  it('generate visualisation', () => {
    const svg = xstateToSvg(stateMachine);
    fs.writeFileSync(path.resolve(__dirname, 'trafficLights.svg'), svg, {
      encoding: 'utf8',
    });
  });
});
