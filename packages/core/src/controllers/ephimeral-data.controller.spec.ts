import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseRegistry } from '../services/database-registry.service';
import request from 'supertest';
import { createDatabase } from '../utils';
import { ControllerFactory } from '../factories/controller.factory';
import { ControllerType } from '../models/controller-type';
import { DelayInterceptor } from '../interceptors/delay.interceptor';
import { MocklyConfig } from '../models/mockly-config';
import { DocumentRepository } from '../repositories/document.repository';
import { DocumentService } from '../services';

describe('EphimeralDataController (e2e)', () => {
  let app;
  let db;

  beforeEach(async () => {
    // if (db) {
    //   await db.destroy();
    // }

    db = createDatabase('dataForEphimeralDataController');

    await db.bulkDocs([{ name: 'status', value: { ok: true } }]);

    const repository = new DocumentRepository<any>(db as any);
    const service = new DocumentService<any>(repository);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        ControllerFactory.create(
          'status',
          null,
          ControllerType.DATA_CONTROLLER
        ),
        ControllerFactory.create('fake', null, ControllerType.DATA_CONTROLLER)
      ],
      providers: [
        {
          provide: 'DataService',
          useValue: service
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
