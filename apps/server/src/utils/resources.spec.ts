import { appendPrefix } from './common';
import { getDefinitions, getResourceFiles, isRestResource } from './resources';
import { ResourceType } from '../models/resource-type';

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
});
