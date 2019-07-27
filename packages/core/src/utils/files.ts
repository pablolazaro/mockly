import { promisify } from 'util';
import { readFile } from 'fs';
import globby from 'globby';
import { join } from 'path';

const promisifiedReadFile = promisify(readFile);

export async function getFilesContent<T>(files: string[]): Promise<T[]> {
  return Promise.all(files.map(path => getFileContent(path)));
}

export async function getFileContent<T>(path: string) {
  const contentAsString = await promisifiedReadFile(path, 'utf-8');
  return JSON.parse(contentAsString);
}

export async function findFiles(
  glob: string,
  cwd: string = ''
): Promise<string[]> {
  return globby(join(cwd, glob));
}
