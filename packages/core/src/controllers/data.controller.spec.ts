import { createDatabase } from '../utils';
import { DatabaseRegistry } from '../services/database-registry.service';
import { DataController } from './data.controller';
import { NotFoundException } from '@nestjs/common';
import { DocumentRepository } from '../repositories/document.repository';
import { DocumentService } from '../services';

describe('DataController', () => {
  let db: PouchDB.Database;
  let controller: DataController<any>;

  beforeEach(async () => {
    if (db) {
      await db.destroy();
    }
    db = createDatabase('data');

    await db.bulkDocs([{ name: 'status', value: { ok: true } }]);

    const repository = new DocumentRepository<any>(db as any);
    const service = new DocumentService<any>(repository);

    controller = new DataController('status', service);
  });

  it('should return data', async () => {
    const data = await controller.getData();

    expect(data).toBeDefined();
    expect(data.ok).toBe(true);

    const postData = await controller.postData();

    expect(postData).toBeDefined();
    expect(postData.ok).toBe(true);
  });

  it('should throw exception if data does not exists', async () => {
    db = createDatabase('data');

    await db.bulkDocs([{ name: 'status', value: { ok: true } }]);

    const repository = new DocumentRepository<any>(db as any);
    const service = new DocumentService<any>(repository);

    const fakeController = new DataController('fake', service);

    expect(fakeController.getData()).rejects.toThrow(NotFoundException);
    expect(fakeController.postData()).rejects.toThrow(NotFoundException);
  });
});
