import { cwd } from 'process';
import { validate, ValidationError } from 'class-validator';
import { ResponseConfig } from '../models/response-config';
import { createDatabase, hydrateDatabase } from './databases';
import { findFiles, getFilesContent } from './files';

export async function getResponsesConfiguration(
  glob: string,
  currentWorkingDirectory = cwd()
): Promise<ResponseConfig[]> {
  const files = await findFiles(glob, currentWorkingDirectory);
  const contents = await getFilesContent(files);

  return contents.reduce(
    (arr: ResponseConfig[], c: any) => [...arr, ...c.responses],
    []
  ) as ResponseConfig[];
}

export async function getResponsesConfigurationErrors(
  configs: ResponseConfig[] = []
): Promise<ValidationError[][]> {
  const errors = await Promise.all(configs.map(cfg => validate(cfg)));
  return errors;
}

export async function createAndHydrateResponsesConfigDatabase(
  configs: ResponseConfig[]
): Promise<PouchDB.Database> {
  const db = createDatabase('responses');
  await hydrateDatabase(db, configs);
  return db;
}
