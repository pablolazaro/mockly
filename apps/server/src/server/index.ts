import { NestFactory } from '@nestjs/core';
import { MocklyModule } from './mockly.module';
import { DatabaseRegistry } from '../services/database-registry.service';
import { MocklyConfig } from '../models';
import { ValidationPipe } from '@nestjs/common';

import rewrite from 'express-urlrewrite';

export async function start (controllers: any[], databasesMap: Map<string, PouchDB.Database>, config: MocklyConfig, rewrites: any) {
  const app = await NestFactory.create(
    MocklyModule.with(
      [...controllers],
      [
        { provide: 'DatabaseRegistry', useValue: new DatabaseRegistry(databasesMap) },
        { provide: MocklyConfig, useValue: config }
      ],
    ),
  );

  Object.keys(rewrites).forEach(key => app.use(rewrite(key, rewrites[key])));

  await app.listen(config.port);
}
