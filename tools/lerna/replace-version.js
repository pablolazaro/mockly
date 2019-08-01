const replace = require('replace-in-file');
const { promisify } = require('util');
const { readFile } = require('fs');
const { cwd } = require('process');
const { join } = require('path');

const readFileAsPromise = promisify(readFile);

async function replaceVersion() {
  try {
    const content = await readFileAsPromise(join(cwd(), 'lerna.json'));
    const contentAsJson = JSON.parse(content);
    const version = contentAsJson.version;

    const result = await replace({
      files: join(cwd(), 'packages', 'angular', 'src', 'utils', 'versions.ts'),
      from: /mocklyVersion = \'\d.\d.\d([a-z0-9\.\-]*)'/g,
      to: `mocklyVersion = '${version}'`
    });

    if (result[0].hasChanged) {
      console.log(`Versions file updated to ${version}`);
    } else {
      throw new Error(
        'No changes made to versions file. Check the regular expression'
      );
    }
  } catch (e) {
    throw new Error(e);
  }
}

replaceVersion();
