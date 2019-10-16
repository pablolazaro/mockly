import { ResourceController } from './resource.controller';
import { createDatabase } from '../utils';
import { DatabaseRegistry } from '../services/database-registry.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ResponseConfig } from '../models';
import { DocumentRepository } from '../repositories/document.repository';
import { DocumentService } from '../services';

describe('ResourceController', () => {
  let db: PouchDB.Database;
  let controller: ResourceController<any>;

  beforeEach(async () => {
    if (db) {
      await db.destroy();
    }
    db = createDatabase<any>('cars');

    const repository = new DocumentRepository<any>(db as any);
    const service = new DocumentService<any>(repository);

    controller = new ResourceController('cars', service);
  });

  it('should instantiate', () => {
    expect(controller).toBeDefined();
  });

  it('should have needed methods', () => {
    expect(controller.create).toBeDefined();
    expect(controller.delete).toBeDefined();
    expect(controller.getAll).toBeDefined();
    expect(controller.getOne).toBeDefined();
    expect(controller.update).toBeDefined();
  });

  it('should create a new resource', async () => {
    const result = await controller.create({ name: 'Kitty', color: 'brown' });
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toBe('Kitty');
    expect(result.color).toBe('brown');
  });

  it('should update an existing resource', async () => {
    const resource = await controller.create({ name: 'Kitty', color: 'brown' });
    const result = await controller.update(resource.id, {
      ...resource,
      color: 'black'
    });

    expect(result).toBeDefined();
    expect(result.id).toBe(resource.id);
    expect(result.name).toBe(resource.name);
    expect(result.color).toBe('black');
  });

  it('should get an existing resource', async () => {
    const resource = await controller.create({ name: 'Kitty', color: 'brown' });
    const result = await controller.getOne(resource.id);

    expect(result).toBeDefined();
    expect(result.id).toBe(resource.id);
    expect(result.name).toBe(resource.name);
    expect(result.color).toBe(resource.color);
  });

  it('should get all resources', async () => {
    await controller.create({ name: 'Kitty', color: 'brown' });
    await controller.create({ name: 'Pippy', color: 'black' });

    const all = await controller.getAll();

    expect(all).toHaveLength(2);
  });

  it('should delete an existing resource', async () => {
    const resource = await controller.create({ name: 'Kitty', color: 'brown' });

    const response = await controller.delete(resource.id);

    expect(response).toBeUndefined();
    await expect(controller.getOne(resource.id)).rejects.toThrow(
      NotFoundException
    );
  });

  it('should throw an error when trying to create an invalid resource', async () => {
    await expect(controller.create(1)).rejects.toThrow(BadRequestException);
  });

  it('should throw an error when trying to update an invalid resource', async () => {
    await expect(controller.update('1', 1)).rejects.toThrow(
      BadRequestException
    );
  });

  it('should throw an error when getting an unexisting resource', async () => {
    await expect(controller.getOne('fakeid')).rejects.toThrow(
      NotFoundException
    );
  });

  it('should throw an error when deleting an unexisting resource', async () => {
    await expect(controller.delete('fakeid')).rejects.toThrow(
      NotFoundException
    );
  });
});
