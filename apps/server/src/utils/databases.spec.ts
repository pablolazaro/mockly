import { createDatabase } from './databases';

describe('Databases utils', () => {
  describe('createDatabase', () => {
    it('should create a database', () => {
      const db = createDatabase('test');

      expect(db).toBeDefined();
      expect(db.name).toBe('test');
    });
  });
});
