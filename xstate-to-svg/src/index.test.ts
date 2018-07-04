import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as rimraf from 'rimraf';
import { xstateToSvg } from './index';

describe('xstateToSvg', () => {
  const descriptionsDir = __dirname + '/descriptions';
  const filenames = fs.readdirSync(descriptionsDir);

  const imagesDir = __dirname + '/images';
  rimraf.sync(imagesDir);

  filenames.forEach((filename) => {
    const description = JSON.parse(
      fs.readFileSync(descriptionsDir + '/' + filename),
    );

    const name = filename.split('.')[0];

    it(name, () => {
      const svg = xstateToSvg(description);

      mkdirp.sync(imagesDir);
      fs.writeFileSync(imagesDir + '/' + name + '.svg', svg);

      expect(svg).toMatchSnapshot();
    });
  });
});
