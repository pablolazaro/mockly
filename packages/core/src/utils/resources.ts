import { cwd } from 'process';
import { ResourceDefinition } from '../models/resource-definition';
import { ResourceType } from '../models/resource-type';
import { createDatabase, hydrateDatabase } from './databases';
import { findFiles, getFilesContent } from './files';

export async function getResourceFiles(
  glob: string,
  currentWorkingDirectory = cwd()
): Promise<string[]> {
  return await findFiles(glob, currentWorkingDirectory);
}

export async function getResourceFilesContent(files: string[]) {
  return await getFilesContent(files);
}

export function getDefinitions(contents: any[]): ResourceDefinition[] {
  return contents.reduce((arr, content) => {
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
}

export async function getResourcesAndDataDefinitions(
  glob: string,
  currentWorkingDirectory = cwd()
) {
  const files = await getResourceFiles(glob, currentWorkingDirectory);
  const filesContentAsJson = await getResourceFilesContent(files);

  return await getDefinitions(filesContentAsJson);
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
