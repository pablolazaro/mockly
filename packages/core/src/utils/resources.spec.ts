jest.mock('./files');

import { findFiles, getFilesContent } from './files';

(findFiles as any).mockReturnValue(Promise.resolve(['']));
(getFilesContent as any).mockReturnValue(
  Promise.resolve([
    {
      artists: [{ id: '1' }]
    }
  ])
);

import {
  createAndHydrateJsonDatabase,
  createAndHydrateResourcesDatabases,
  getDefinitions,
  getResourceFiles,
  getResourceFilesContent,
  getResourcesAndDataDefinitions,
  isRestResource
} from './resources';
import { ResourceType } from '../models/resource-type';
import { ResourceDefinition } from '../models/resource-definition';

describe('Resources utils', () => {
  describe('getDefinitions', () => {
    it('should get definitions', () => {
      const contents = [
        {
          artists: [],
          albums: [{ id: 1 }],
          me: { id: 1 }
        }
      ];

      const defs = getDefinitions(contents);

      expect(defs).toBeDefined();
      expect(defs).toHaveLength(3);
      expect(defs[0].type).toBe(ResourceType.REST_RESOURCE);
      expect(defs[1].type).toBe(ResourceType.REST_RESOURCE);
      expect(defs[2].type).toBe(ResourceType.JSON_DATA);
    });
  });

  describe('isRestResource', () => {
    it('should return true if an empty array is passed', () => {
      expect(isRestResource([])).toBe(true);
    });

    it('should return false if an empty object is passed', () => {
      expect(isRestResource({})).toBe(false);
    });

    it('should return false if a string, number or boolean is passed', () => {
      expect(isRestResource(1)).toBe(false);
      expect(isRestResource('1')).toBe(false);
      expect(isRestResource(true)).toBe(false);
    });

    it('should return true if an array of objects is passed', () => {
      expect(isRestResource([{}, {}, {}])).toBe(true);
    });

    it('should return false if an array of strings, numbers or boleans is passed', () => {
      expect(isRestResource([1, 2, 3])).toBe(false);
      expect(isRestResource(['1', '2', '3'])).toBe(false);
      expect(isRestResource([true, false, true])).toBe(false);
    });
  });

  describe('createAndHydrateJsonDatabase', () => {
    it('should create an hydrate database', async () => {
      const resources = [
        {
          name: 'me',
          type: ResourceType.JSON_DATA,
          resources: { name: 'Peter' }
        }
      ] as ResourceDefinition[];

      const db = await createAndHydrateJsonDatabase(resources);

      expect(db).toBeDefined();
      expect(db.name).toBe('data');

      expect((await db.allDocs()).rows).toHaveLength(1);
    });
  });

  describe('createAndHydrateResourcesDatabases', () => {
    it('should create an hydrates resources database', async () => {
      const resources = [
        {
          name: 'artists',
          type: ResourceType.REST_RESOURCE,
          resources: [{ name: 'Bon Jovi' }, { name: 'Georgie Dann' }]
        }
      ] as ResourceDefinition[];

      const map = await createAndHydrateResourcesDatabases(resources);

      expect(map).toBeDefined();
      expect(map.has('artists')).toBe(true);
      expect(map.get('artists')).toBeDefined();
      expect(map.get('artists').name).toBe('artists');
      expect((await map.get('artists').allDocs()).rows).toHaveLength(2);
    });
  });

  describe('getResourceFiles', () => {
    it('should get resource files', async () => {
      const files = await getResourceFiles('**/*.resource.json');

      expect(files).toBeDefined();
      expect(files).toHaveLength(1);
    });
  });

  describe('getResourceFilesContent', () => {
    it('should get files content', async () => {
      const content = await getResourceFilesContent(['']);
      expect(content).toBeDefined();
      expect(content).toHaveLength(1);
      expect(content[0]).toBeDefined();
    });
  });

  describe('getResourcesAndDataDefinitions', () => {
    it('should get definitions', async () => {
      const defs = await getResourcesAndDataDefinitions('**');

      expect(defs).toBeDefined();
      expect(defs).toHaveLength(1);
      expect(defs[0]).toBeDefined();
      expect(defs[0].name).toBe('artists');
      expect(defs[0].type).toBe(ResourceType.REST_RESOURCE);
    });
  });
});
