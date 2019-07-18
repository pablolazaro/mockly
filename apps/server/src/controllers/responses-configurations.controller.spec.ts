import { createResourceDatabase } from '../utils';
import { DatabaseRegistry } from '../services/database-registry.service';
import { ResponsesConfigurationsController } from './responses-configurations.controller';
import { ResponsesConfigurationsService } from '../services/responses-configurations.service';
import { NotFoundException } from '@nestjs/common';

describe('ResponsesConfigurationsController', () => {

  let db: PouchDB.Database;
  let controller: ResponsesConfigurationsController;

  beforeEach(async () => {
    if (db) { await db.destroy();}
    db = createResourceDatabase('responses');

    await db.bulkDocs([{ _id: '12345', path: '/cats', status: 500 }]);

    const map = new Map();
    map.set('responses', db);
    controller = new ResponsesConfigurationsController(new ResponsesConfigurationsService(new DatabaseRegistry(map)));
  });

  it('should instantiate', () => {
    expect(controller).toBeDefined();
  });

  it('should have needed methods', () => {
    expect(controller.all).toBeDefined();
    expect(controller.get).toBeDefined();
    expect(controller.update).toBeDefined();
  });

  it('should get all configurations', async () => {
    const configurations = await controller.all();

    expect(configurations).toBeDefined();
    expect(configurations).toHaveLength(1);
  });

  it('should get one configuration', async () => {
    const config = await controller.get('12345');

    expect(config).toBeDefined();
    expect(config._id).toBe('12345')
  });

  it('should update one configuration', async () => {
    const config = await controller.update('12345', { method: 'GET', path: '/cats', status: 401 });

    expect(config).toBeDefined();
    expect(config._id).toBe('12345');
    expect(config.status).toBe(401);
  });

  it('should throw error when trying to get a nonexisting configuration', async () => {
    expect(controller.get('fakeid')).rejects.toThrow(NotFoundException);
  });

  it('should throw error when trying to update a nonexisting configuration', async () => {
    expect(controller.update('fakeid', {} as any)).rejects.toThrow(NotFoundException);
  });
});
