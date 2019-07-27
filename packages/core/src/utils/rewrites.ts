import { cwd } from 'process';
import { findFiles, getFilesContent } from './files';
import { RewriteConfig } from '../models/rewrite-config';
import { MocklyConfig, ResponseConfig } from '../models';
import { validate, ValidationError } from 'class-validator';

export async function getRewritesFiles(
  glob: string,
  currentWorkingDirectory = cwd()
): Promise<string[]> {
  return await findFiles(glob, currentWorkingDirectory);
}

export async function getRewrites(
  glob: string,
  currentWorkingDirectory = cwd()
): Promise<RewriteConfig[]> {
  const files = await getRewritesFiles(glob, currentWorkingDirectory);
  const contents = await getFilesContent(files);

  const rewrites = contents.reduce((arr: RewriteConfig[], content) => {
    const keys = Object.keys(content);
    const configs = keys.map(key => new RewriteConfig(key, content[key]));

    return [...arr, ...configs];
  }, []);

  return rewrites;
}

export async function getRewritesConfigurationErrors(
  configs: RewriteConfig[] = []
): Promise<ValidationError[][]> {
  return await Promise.all(configs.map(cfg => validate(cfg)));
}
