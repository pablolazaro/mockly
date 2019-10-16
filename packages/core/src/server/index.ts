import { NestFactory } from '@nestjs/core';
import { MocklyModule } from './mockly.module';
import { MocklyConfig } from '../models';

import rewrite from 'express-urlrewrite';
import { Provider } from '@nestjs/common';
import { capitalizeFirstLetter } from '../utils';
import { DocumentService } from '../services';
import { DocumentRepository } from '../repositories/document.repository';

export async function start(
  controllers: any[],
  databasesMap: Map<string, PouchDB.Database>,
  config: MocklyConfig,
  rewrites: any
) {
  let providers = createProviders(databasesMap);

  providers = [...providers, { provide: MocklyConfig, useValue: config }];

  const app = await NestFactory.create(
    MocklyModule.with([...controllers], [...providers])
  );

  Object.keys(rewrites).forEach(key => app.use(rewrite(key, rewrites[key])));

  app.enableCors();

  await app.listen(config.port);
}

function createProviders(map: Map<string, PouchDB.Database>): Provider[] {
  const databaseProviders = createDatabasesProviders(map);
  const servicesProviders = createServicesProviders(map);

  return [...databaseProviders, ...servicesProviders];
}

function createDatabasesProviders(
  map: Map<string, PouchDB.Database>
): Provider[] {
  const keys = Array.from(map.keys());

  return keys.map(key => {
    return {
      provide: `${capitalizeFirstLetter(key)}Database`,
      useValue: map.get(key)
    };
  });
}

function createServicesProviders(
  map: Map<string, PouchDB.Database>
): Provider[] {
  const keys = Array.from(map.keys());

  return keys.map(key => {
    return {
      provide: `${capitalizeFirstLetter(key)}Service`,
      useValue: new DocumentService(new DocumentRepository<any>(map.get(key)))
    };
  });
}
