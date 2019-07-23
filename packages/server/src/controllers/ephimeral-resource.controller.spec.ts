import { MocklyConfig } from './../models/mockly-config';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseRegistry } from '../services/database-registry.service';
import request from 'supertest';
import { createDatabase } from '../utils';
import { ControllerFactory } from '../factories/controller.factory';
import { ControllerType } from '../models/controller-type';
import { DelayInterceptor } from '../interceptors/delay.interceptor';

describe('EphimeralResourceController (e2e)', () => {
  let app;
  let db;

  beforeEach(async () => {
    db = createDatabase('cats');

    await db.bulkDocs([
      { id: '1', name: 'Kitty', color: 'brown' },
      { id: '2', name: 'Pitty', color: 'black' }
    ]);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        ControllerFactory.create(
          'cats',
          null,
          ControllerType.RESOURCE_CONTROLLER
        )
      ],
      providers: [
        {
          provide: DatabaseRegistry,
          useValue: new DatabaseRegistry(new Map().set('cats', db), '')
        },
        DelayInterceptor,
        {
          provide: MocklyConfig,
          useValue: {
            delay: 1,
            port: 3000,
            prefix: '',
            resourceFilesGlob: '',
            rewritesFilesGlob: '',
            responsesConfigGlob: ''
          }
        }
      ]
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterEach(async () => {
    await db.destroy();
  });

  it('should get resources', async () => {
    const response = await request(app.getHttpServer())
      .get('/cats')
      .expect(200);
    const data = JSON.parse(response.text);
    expect(data).toBeDefined();
    expect(data).toHaveLength(2);
  });

  it('should get a resource', async () => {
    const response = await request(app.getHttpServer())
      .get('/cats/1')
      .expect(200);
    const data = JSON.parse(response.text);
    expect(data).toBeDefined();
    expect(data.id).toBe('1');
  });

  it('should create a resource', async () => {
    const response = await request(app.getHttpServer())
      .post('/cats')
      .send({ name: 'Holy', color: 'white' })
      .expect(201);

    const data = JSON.parse(response.text);

    expect(data).toBeDefined();
    expect(data.id).toBeDefined();
  });

  it('should update a resource', async () => {
    const response = await request(app.getHttpServer())
      .put('/cats/1')
      .send({ id: '1', name: 'Kitty', color: 'red' })
      .expect(200);

    const data = JSON.parse(response.text);

    expect(data).toBeDefined();
    expect(data.color).toBe('red');
  });

  xit('should delete a resource', async () => {
    await request(app.getHttpServer())
      .delete('/cats/1')
      .expect(204);

    await request(app.getHttpServer())
      .get('/cats/1')
      .expect(404);
  });

  xit('should return 404 when trying to get, update or delete an nonexistent resource', async () => {
    await request(app.getHttpServer())
      .get('/cats/999')
      .expect(404);

    await request(app.getHttpServer())
      .put('/cats/999')
      .expect(404);

    await request(app.getHttpServer())
      .delete('/cats/999')
      .expect(404);
  });

  xit('should return 400 when trying to create or update a resource with an invalid body', async () => {
    await request(app.getHttpServer())
      .post('/cats')
      .send()
      .expect(400);

    await request(app.getHttpServer())
      .put('/cats/1')
      .send()
      .expect(400);
  });
});
