import { createDatabase, hydrateDatabase } from './databases';
import PouchDB from 'pouchdb';

describe('Databases utils', () => {
  let db: PouchDB.Database;

  beforeAll(() => {
    db = createDatabase('test');
  });

  afterAll(() => {
    db.destroy();
  });

  describe('createDatabase', () => {
    it('should create a database', () => {
      expect(db).toBeDefined();
      expect(db.name).toBe('test');
    });
  });

  describe('hydrateDatabase', () => {
    it('should hydrate a database', async () => {
      await hydrateDatabase(db, [{ name: 'Kitty ' }]);
      const result = await db.allDocs();
      expect(result.rows).toHaveLength(1);
    });
  });
});
