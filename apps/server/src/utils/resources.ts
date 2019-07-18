import globby from 'globby';
import { join } from 'path';
import { cwd } from 'process';
import { promisify } from 'util';
import { readFile} from 'fs';
import PouchDB from 'pouchdb';

import find from 'pouchdb-find';
import adapter from 'pouchdb-adapter-memory';
import { Controller } from '@nestjs/common';
import { DatabaseRegistry } from '../services/database-registry.service';
import { ResourceControllerFactory } from '../factories/resource-controller.factory';
import { DataControllerFactory } from '../factories/data-controller.factory';
import uniqid from 'uniqid';

PouchDB.plugin(adapter);
PouchDB.plugin(find);

const promisifiedReadFile = promisify(readFile);

export enum ResourceType { REST_RESOURCE, JSON_RESPONSE }

export interface ResourceDefinition {
  name: string;
  resources: any;
  type: ResourceType;
}

export async function getResourceFiles(glob: string, currentWorkingDirectory = cwd()): Promise<string[]> {
  return await globby([
    join(currentWorkingDirectory, glob),
    join('!', currentWorkingDirectory, '**', '/', 'responses.resource.json'),
  ]);
}

export async function getResourceDefinitions(files: string[]): Promise<ResourceDefinition[]> {
  const readFilesPromises = files.map(file => promisifiedReadFile(file, 'utf-8'));

  try {
    const filesContent = await Promise.all(readFilesPromises);
    const filesContentAsJson = filesContent.map(content => JSON.parse(content));

    return filesContentAsJson.reduce((arr, content) => {
      const resourceCollectionDefinitions = Object.keys(content)
        .filter(key => key !== '$schema')
        .map(key => {
          const resources = content[key];

          if (isRestResource(resources)) {
            return { name: key, resources, type: ResourceType.REST_RESOURCE};
          } else {
            return { name: key, resources, type: ResourceType.JSON_RESPONSE};
          }
        });

      return [ ...arr, ...resourceCollectionDefinitions ];
    }, []);
  } catch (error) {
    // TODO Throw error and catch it later
  }

}

export async function createAndHydrateResourcesDatabases (resources: ResourceDefinition[]): Promise<Map<string, PouchDB.Database>> {
  const dbs = resources
    .map(resource => createResourceDatabase(resource.name));

  const hydratingPromises = dbs.map((db, index) => hydrateDatabase(db, resources[index].resources));

  const result = await Promise.all(hydratingPromises);

  return dbs.reduce((map, db, i) => map.set(resources[i].name, db) , new Map());
}

export function createResourceDatabase (name: string): PouchDB.Database {
  return new PouchDB(name, { adapter: 'memory' });
}

export async function hydrateDatabase (db: PouchDB.Database, resources: any[]) {
  return await db.bulkDocs(resources);
}

export function isRestResource (resources: any) {
  return Array.isArray(resources) && resources.every(resource => typeof resource === 'object' && !Array.isArray(resource));
}

export async function createAndHydrateJsonDatabase (resources: ResourceDefinition[]): Promise<PouchDB.Database> {
  const db = createResourceDatabase('data');

  const promises = resources.map(resource => db.post({ name: resource.name, value: resource.resources}));

  await Promise.all(promises)

  return db;
}

export function getDataControllers (resources: ResourceDefinition[], prefix = ''): any[] {
  return resources.map(resource => DataControllerFactory.createController(resource.name, prefix));
}

export function getResourcesControllers (resources: ResourceDefinition[], prefix = ''): any[] {
  return resources.map(resource => ResourceControllerFactory.createController(resource.name, prefix));
}

export function capitalizeFirstLetter(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function appendPrefix (name: string, prefix: string) {
  if (prefix !== undefined && prefix !== null && prefix !== '') {
    return prefix + (prefix.endsWith('/') ? '' : '/') + name;
  } else {
    return name;
  }
}


export function getRandomId (): string {
  return uniqid();
}
