import globby from 'globby';
import { join } from 'path';
import { cwd } from 'process';
import { promisify } from 'util';
import { readFile } from 'fs';
import { ResourceDefinition } from '../models/resource-definition';
import { ResourceType } from '../models/resource-type';
import { createDatabase, hydrateDatabase } from './databases';

const promisifiedReadFile = promisify(readFile);

export async function getResourceFiles(
  glob: string,
  currentWorkingDirectory = cwd()
): Promise<string[]> {
  return await globby([
    join(currentWorkingDirectory, glob),
    join('!', currentWorkingDirectory, '**', '/', 'responses.resource.json')
  ]);
}

export async function buildDefinitions(
  files: string[]
): Promise<ResourceDefinition[]> {
  const readFilesPromises = files.map(file =>
    promisifiedReadFile(file, 'utf-8')
  );

  try {
    const filesContent = await Promise.all(readFilesPromises);
    const filesContentAsJson = filesContent.map(content => JSON.parse(content));

    return filesContentAsJson.reduce((arr, content) => {
      const resourceCollectionDefinitions = Object.keys(content)
        .filter(key => key !== '$schema')
        .map(key => {
          const resources = content[key];

          if (isRestResource(resources)) {
            return { name: key, resources, type: ResourceType.REST_RESOURCE };
          } else {
            return { name: key, resources, type: ResourceType.JSON_DATA };
          }
        });

      return [...arr, ...resourceCollectionDefinitions];
    }, []);
  } catch (error) {
    // TODO Throw error and catch it later
  }
}

export async function getResourcesAndDataDefinitions(
  glob: string,
  currentWorkingDirectory = cwd()
) {
  const files = await getResourceFiles(glob, currentWorkingDirectory);

  return await buildDefinitions(files);
}

export async function createAndHydrateResourcesDatabases(
  resources: ResourceDefinition[]
): Promise<Map<string, PouchDB.Database>> {
  const dbs = resources.map(resource => createDatabase(resource.name));

  const hydratingPromises = dbs.map((db, index) =>
    hydrateDatabase(db, resources[index].resources)
  );

  const result = await Promise.all(hydratingPromises);

  return dbs.reduce((map, db, i) => map.set(resources[i].name, db), new Map());
}

export function isRestResource(resources: any) {
  return (
    Array.isArray(resources) &&
    resources.every(
      resource => typeof resource === 'object' && !Array.isArray(resource)
    )
  );
}

export async function createAndHydrateJsonDatabase(
  resources: ResourceDefinition[]
): Promise<PouchDB.Database> {
  const db = createDatabase('data');

  const promises = resources.map(resource =>
    db.post({ name: resource.name, value: resource.resources })
  );

  await Promise.all(promises);

  return db;
}
