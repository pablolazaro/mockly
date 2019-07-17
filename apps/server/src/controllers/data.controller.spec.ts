import { createResourceDatabase } from '../utils';
import { DatabaseRegistry } from '../services/database-registry.service';
import { DataController } from './data.controller';
import { NotFoundException } from '@nestjs/common';

describe('DataController', () => {

  let db: PouchDB.Database;
  let controller: DataController<any>;
  let map: Map<string, PouchDB.Database>;

  beforeEach(async () => {
    if (db) { await db.destroy();}
    db = createResourceDatabase('data');

    await db.bulkDocs([{ name: 'status', value: { ok: true }}]);

    map = new Map();
    map.set('data', db);
    controller = new DataController(new DatabaseRegistry(map), 'status');
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
    const fakeController = new DataController(new DatabaseRegistry(map), 'fake');

    expect(fakeController.getData()).rejects.toThrow(NotFoundException);
    expect(fakeController.postData()).rejects.toThrow(NotFoundException);
  });

});
