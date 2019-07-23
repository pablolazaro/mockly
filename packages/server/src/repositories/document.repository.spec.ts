import { DocumentRepository } from './document.repository';
import { createDatabase } from '../utils';

interface Cat {
  id: string;
  name: string;
}

describe('DocumentRepository', () => {
  let repository: DocumentRepository<Cat>;
  let db: PouchDB.Database<Cat>;

  beforeEach(async () => {
    db = createDatabase<Cat>('cats');

    await db.bulkDocs([
      { _id: '1', id: '1', name: 'Kitty' },
      { _id: '2', id: '2', name: 'Pebbels' },
      { _id: '3', id: '3', name: 'Peter' }
    ]);

    repository = new DocumentRepository<Cat>(db);
  });

  afterEach(async () => {
    await db.destroy();
  });

  describe('getById', () => {
    it('should return an error if the document does not exists', async () => {
      expect(repository.getById('4')).rejects.toThrowError();
    });

    it('should return an existing document', async () => {
      const doc = await repository.getById('1');
      expect(doc).toBeDefined();
    });
  });

  describe('getAll', () => {
    it('should get all documents', async () => {
      const docs = await repository.getAll();

      expect(docs).toBeDefined();
      expect(docs).toHaveLength(3);
    });
  });

  describe('delete', () => {
    it('should delete a document', async () => {
      const doc = await repository.getById('1');
      const response = await repository.delete(doc);

      expect(response).toBeDefined();
      expect(response.ok).toBe(true);
    });

    it('should return an error if the document does not exists', async () => {
      const doc = { _id: '123', _rev: '123' };

      expect(repository.delete(doc)).rejects.toThrowError();
    });
  });

  describe('create', () => {
    it('should create a document', async () => {
      const cat = { id: '4', name: 'Nala' };
      const response = await repository.create(cat);

      expect(response).toBeDefined();
      expect(response.ok).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a document', async () => {
      const doc = await repository.getById('1');
      const response = await repository.update({
        ...doc,
        name: 'No kitty anymore'
      });

      expect(response).toBeDefined();
      expect(response.ok).toBe(true);
    });

    it('should return an error if the document does not exists', async () => {
      const doc = await repository.getById('1');

      expect(repository.update({ ...doc, _id: '123' })).rejects.toThrowError();
    });
  });

  describe('find', () => {
    it('should find documents', async () => {
      const response = await repository.find({
        selector: { name: { $eq: 'Kitty' } }
      });

      expect(response).toBeDefined();
      expect(response.docs).toHaveLength(1);
    });
  });
});
