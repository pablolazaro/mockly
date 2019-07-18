import { createResourceDatabase } from '../utils';
import { DatabaseRegistry } from '../services/database-registry.service';
import { ResponsesConfigurationsController } from './responses-configurations.controller';
import { ResponsesConfigurationsService } from '../services/responses-configurations.service';
import { NotFoundException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

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


describe('ResponsesConfigurationsController (e2e)', () => {
  let app;
  let db: PouchDB.Database;

  beforeEach(async () => {
    if (db) { await db.destroy();}
    db = createResourceDatabase('responses');

    await db.bulkDocs([{ _id: '12345', path: '/cats', method: 'GET', status: 500 }]);

    const map = new Map();
    map.set('responses', db);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ResponsesConfigurationsController],
      providers: [
        ResponsesConfigurationsService,
        {
          provide: DatabaseRegistry,
          useValue: new DatabaseRegistry(new Map().set('responses', db))
        }
      ]
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(new ValidationPipe());

    await app.init();
  });

  it('should get all configurations', async () => {
    const response = await request(app.getHttpServer()).get('/responses').expect(200);

    const data = JSON.parse(response.text);
    expect(data).toBeDefined();
    expect(data).toHaveLength(1);
  });

  it('should get a response configuration', async () => {
    const response = await request(app.getHttpServer()).get('/responses/12345').expect(200);
    const data = JSON.parse(response.text);
    expect(data).toBeDefined();
    expect(data._id).toBe('12345');
  });


  it('should update a configuration', async() => {
    const response = await request(app.getHttpServer())
      .patch('/responses/12345')
      .send({ _id: '12345', path: '/cats', method: 'GET', status: 401 })
      .expect(200);

    const data = JSON.parse(response.text);

    expect(data).toBeDefined();
    expect(data._id).toBe('12345');
    expect(data.path).toBe('/cats');
    expect(data.method).toBe('GET');
    expect(data.status).toBe(401);
  });

  it('should return 400 when trying to update a configuration with invalid values', async () => {
    await request(app.getHttpServer())
      .patch('/responses/12345')
      .send({ path: {} })
      .expect(400);

    await request(app.getHttpServer())
      .patch('/responses/12345')
      .send({ status: 'text' })
      .expect(400);

    await request(app.getHttpServer())
      .patch('/responses/12345')
      .send({ headers: 1 })
      .expect(400);

    await request(app.getHttpServer())
      .patch('/responses/12345')
      .send({ cookies: 1 })
      .expect(400);

    await request(app.getHttpServer())
      .patch('/responses/12345')
      .send({ delay: 'text' })
      .expect(400);
  });


});
