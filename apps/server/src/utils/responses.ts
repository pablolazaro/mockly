import { cwd } from 'process';
import { join } from 'path';
import globby from 'globby';
import { promisify } from 'util';
import { readFile } from 'fs';
import { MocklyConfig } from '../models';
import { validate, ValidationError } from 'class-validator';
import { ResponseConfig } from '../models/response-config';
import { createResourceDatabase, hydrateDatabase } from './resources';

const promisifiedReadFile = promisify(readFile);

export async function getResponsesConfiguration(
  glob: string,
  currentWorkingDirectory = cwd()
): Promise<ResponseConfig[]> {
  const files = await globby([join(currentWorkingDirectory, glob)]);

  if (files.length > 0) {
    const file = files[0];
    const content = await promisifiedReadFile(file, 'utf-8');

    return JSON.parse(content).responses as ResponseConfig[];
  } else {
    return [];
  }
}

export async function getResponsesConfigurationErrors(
  configs: ResponseConfig[] = []
): Promise<ValidationError[][]> {
  const errors = await Promise.all(configs.map(cfg => validate(cfg)));
  return errors;
}

export async function createAndHydrateResponsesConfigDatabase(
  configs: ResponseConfig[]
) {
  const db = createResourceDatabase('responses');
  await hydrateDatabase(db, configs);
  return db;
}
