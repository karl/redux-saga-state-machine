import * as fs from 'fs';
import * as path from 'path';
import { xstateToSvg } from '../../xstate-to-svg/dist';
import { stateMachine } from './player';

describe('state machine', () => {
  it('generate visualisation', () => {
    const svg = xstateToSvg(stateMachine);
    fs.writeFileSync(path.resolve(__dirname, 'state-machine.svg'), svg, {
      encoding: 'utf8',
    });
  });
});
