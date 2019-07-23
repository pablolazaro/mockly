import { NestApplication, NestFactory } from '@nestjs/core';
import { MocklyModule } from './mockly.module';
import { DatabaseRegistry } from '../services/database-registry.service';
import { MocklyConfig } from '../models';

import rewrite from 'express-urlrewrite';
import { INestApplication } from '@nestjs/common';

export async function start(
  controllers: any[],
  databasesMap: Map<string, PouchDB.Database>,
  config: MocklyConfig,
  rewrites: any
): Promise<INestApplication> {
  const app = await NestFactory.create(
    MocklyModule.with(
      [...controllers],
      [
        {
          provide: 'DatabaseRegistry',
          useValue: new DatabaseRegistry(databasesMap)
        },
        { provide: MocklyConfig, useValue: config }
      ]
    )
  );

  Object.keys(rewrites).forEach(key => app.use(rewrite(key, rewrites[key])));

  app.enableCors();
  app.enableShutdownHooks();

  await app.listen(config.port);

  return app;
}
