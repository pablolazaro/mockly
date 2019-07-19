import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseRegistry } from '../services/database-registry.service';
import request from 'supertest';
import { createResourceDatabase } from '../utils';
import { DataControllerFactory } from '../factories/data-controller.factory';

describe('EphimeralDataController (e2e)', () => {
  let app;
  let db;

  beforeEach(async () => {
    if (db) {
      await db.destroy();
    }

    db = createResourceDatabase('data');

    await db.bulkDocs([{ name: 'status', value: { ok: true } }]);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        DataControllerFactory.createController('status'),
        DataControllerFactory.createController('fake')
      ],
      providers: [
        {
          provide: DatabaseRegistry,
          useValue: new DatabaseRegistry(new Map().set('data', db))
        }
      ]
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  it('should get data', async () => {
    const response = await request(app.getHttpServer())
      .get('/status')
      .expect(200);
    const data = JSON.parse(response.text);
    expect(data).toBeDefined();
    expect(data.ok).toBe(true);

    const responsePost = await request(app.getHttpServer())
      .post('/status')
      .expect(200);
    const dataPost = JSON.parse(responsePost.text);
    expect(dataPost).toBeDefined();
    expect(dataPost.ok).toBe(true);
  });

  it('should return 404 if data does not exists', async () => {
    await request(app.getHttpServer())
      .get('/fake')
      .expect(404);

    await request(app.getHttpServer())
      .post('/fake')
      .expect(404);
  });
});
