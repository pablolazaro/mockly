import {
  Module,
  Provider,
  DynamicModule,
  NestModule,
  MiddlewareConsumer
} from '@nestjs/common';
import { ResponseMiddleware } from '../middlewares/request-catcher.middleware';
import { ResponsesConfigurationsController } from '../controllers/responses-configurations.controller';
import { DocumentServiceRegistry } from '../services';

const MOCKLY_CONTROLLERS = [ResponsesConfigurationsController];
const MOCKLY_PROVIDERS = [];

@Module({})
export class MocklyModule implements NestModule {
  static with(controllers: any[], providers: Provider[]): DynamicModule {
    return {
      module: MocklyModule,
      controllers: [...MOCKLY_CONTROLLERS, ...controllers],
      providers: [...MOCKLY_PROVIDERS, ...providers]
    };
  }

  configure(consumer: MiddlewareConsumer): MiddlewareConsumer {
    return consumer.apply(ResponseMiddleware).forRoutes('*');
  }
}
