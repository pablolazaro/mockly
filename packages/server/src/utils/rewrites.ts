import { cwd } from 'process';
import globby from 'globby';
import { join } from 'path';
import { promisify } from 'util';
import { readFile } from 'fs';

const promisifiedReadFile = promisify(readFile);

export async function getRewritesFiles(
  glob: string,
  currentWorkingDirectory = cwd()
): Promise<string[]> {
  return await globby([join(currentWorkingDirectory, glob)]);
}

export async function getRewrites(
  glob: string,
  currentWorkingDirectory = cwd()
) {
  const files = await getRewritesFiles(glob, currentWorkingDirectory);

  const promises = files.map(file => promisifiedReadFile(file, 'utf-8'));

  const contents = await Promise.all(promises);

  const rewrites = contents
    .map(content => JSON.parse(content))
    .reduce((obj, content) => ({ ...obj, ...content }), {});

  return rewrites;
}
