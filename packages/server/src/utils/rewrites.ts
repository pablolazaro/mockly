import { cwd } from 'process';
import { findFiles, getFilesContent } from './files';

export async function getRewritesFiles(
  glob: string,
  currentWorkingDirectory = cwd()
): Promise<string[]> {
  return await findFiles(glob, currentWorkingDirectory);
}

export async function getRewrites(
  glob: string,
  currentWorkingDirectory = cwd()
) {
  const files = await getRewritesFiles(glob, currentWorkingDirectory);
  const contents = await getFilesContent(files);

  const rewrites = contents.reduce(
    (obj, content) => ({ ...obj, ...content }),
    {}
  );

  return rewrites;
}
