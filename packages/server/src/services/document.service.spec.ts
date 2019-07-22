import { DocumentRepository } from '../repositories/document.repository';
import { createDatabase } from '../utils';
import { DocumentService } from './document.service';
import { NotFoundException } from '@nestjs/common';

interface Cat {
  id: string;
  name: string;
}

describe('DocumentService', () => {
  let repository: DocumentRepository<Cat>;
  let db: PouchDB.Database<Cat>;
  let service: DocumentService<Cat>;

  beforeEach(async () => {
    db = createDatabase<Cat>('catsForDocumentService');

    await db.bulkDocs([
      { _id: '1', id: '1', name: 'Kitty' },
      { _id: '2', id: '2', name: 'Pebbels' },
      { _id: '3', id: '3', name: 'Peter' }
    ]);

    repository = new DocumentRepository<Cat>(db);
    service = new DocumentService(repository);
  });

  afterEach(async () => {
    // await db.destroy();
  });

  describe('getById', () => {
    describe('by internal id', () => {
      it('should get document', async () => {
        const doc = await service.getById('1');
        expect(doc).toBeDefined();
      });

      it('should throw an error when trying to get a nonexisting document', async () => {
        expect(service.getById('999')).rejects.toThrowError(NotFoundException);
      });
    });

    describe('by id property', () => {
      it('should get document', async () => {
        const doc = await service.getById('1', false);
        expect(doc).toBeDefined();
      });

      it('should throw an error when trying to get a nonexisting document', async () => {
        expect(service.getById('999', false)).rejects.toThrowError(
          NotFoundException
        );
      });
    });
  });

  describe('getAll', () => {
    it('should get all documents', async () => {
      const docs = await service.getAll();

      expect(docs).toBeDefined();
      expect(docs).toHaveLength(3);
    });
  });

  describe('create', () => {
    it('should create a document', async () => {
      const cat = { id: '4', name: 'Nala' };
      const doc = await service.create(cat);

      expect(doc).toBeDefined();
      expect(doc.id).toBe('4');
    });
  });

  describe('find', () => {
    it('should find documents', async () => {
      const response = await service.find({
        selector: { name: { $eq: 'Kitty' } }
      });

      expect(response).toBeDefined();
      expect(response.docs).toHaveLength(1);
    });
  });

  describe('update', () => {
    describe('by internal id', () => {
      it('should update a document', async () => {
        const doc = await service.getById('1');
        const response = await service.update({ ...doc, name: 'Kitty2' });
        expect(response).toBeDefined();
        expect(response.name).toBe('Kitty2');
      });

      it('should throw an error when trying to get a nonexisting document', async () => {
        const doc = await service.getById('1');
        expect(service.update({ ...doc, _id: '999' })).rejects.toThrowError(
          NotFoundException
        );
      });
    });

    describe('by id property', () => {
      it('should get document', async () => {
        const doc = await service.getById('1', false);
        const response = await service.update(
          { ...doc, name: 'Kitty2' },
          false
        );
        expect(response).toBeDefined();
        expect(response.name).toBe('Kitty2');
      });

      it('should throw an error when trying to get a nonexisting document', async () => {
        const doc = await service.getById('1', false);
        expect(
          service.update({ ...doc, id: '999' }, false)
        ).rejects.toThrowError(NotFoundException);
      });
    });
  });

  describe('delete', () => {
    describe('by internal id', () => {
      it('should delete a document', async () => {
        expect(service.delete('1')).resolves.toBeUndefined();
      });

      it('should throw an error when trying to get a nonexisting document', async () => {
        expect(service.delete('999')).rejects.toThrowError(NotFoundException);
      });
    });

    describe('by id property', () => {
      it('should get document', async () => {
        expect(service.delete('1', false)).resolves.toBeUndefined();
      });

      it('should throw an error when trying to get a nonexisting document', async () => {
        expect(service.delete('999', false)).rejects.toThrowError(
          NotFoundException
        );
      });
    });
  });
});
