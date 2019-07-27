import {
  createAndHydrateResponsesConfigDatabase,
  getResponsesConfiguration,
  getResponsesConfigurationErrors
} from './responses';

jest.mock('./files');

import { findFiles, getFilesContent } from './files';
import { ResponseConfig } from '../models';

(findFiles as any).mockReturnValue(['responses.config.json']);
(getFilesContent as any).mockReturnValue([
  { responses: [{ path: '/cats', method: 'GET', status: 400 }] }
]);

describe('Responses utils', () => {
  describe('getResponsesConfiguration', () => {
    it('should get responses configuration', async () => {
      const config = await getResponsesConfiguration(
        '**/*.responses.config.json'
      );

      expect(config).toBeDefined();
      expect(config).toHaveLength(1);
      expect(config[0].path).toBe('/cats');
      expect(config[0].method).toBe('GET');
      expect(config[0].status).toBe(400);
    });
  });

  describe('getResponsesConfigurationErrors', () => {
    it('should validate a valid config', async () => {
      const config = [
        new ResponseConfig(null, null, null, null, 'GET', '/cats', 400)
      ];

      const errors = await getResponsesConfigurationErrors(config);
      expect(errors.every(error => error.length === 0)).toBe(true);
    });

    it('should validate an invalid config', async () => {
      const config = [
        new ResponseConfig(null, null, null, null, 'GET', '/cats', '400' as any)
      ];

      const errors = await getResponsesConfigurationErrors(config);
      expect(errors.every(error => error.length === 0)).toBe(false);
    });
  });

  describe('createAndHydrateResponsesConfigDatabase', () => {
    it('should create and hydrate responses config', async () => {
      const config = [
        new ResponseConfig(null, null, null, null, 'GET', '/cats', '400' as any)
      ];

      const db = await createAndHydrateResponsesConfigDatabase(config);

      expect(db).toBeDefined();
      expect(db.name).toBe('responses');

      const docs = await db.allDocs();
      expect(docs.rows).toHaveLength(1);

      await db.destroy();
    });
  });
});
