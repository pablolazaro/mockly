import {
  Module,
  Provider,
  DynamicModule,
  NestModule,
  MiddlewareConsumer,
} from '@nestjs/common';
import { ResponsesConfigService } from '../services/response-config.service';
import { ResponseMiddleware } from '../middlewares/request-catcher.middleware';
import { ResponsesConfigurationsController } from '../controllers/responses-configurations.controller';

const MOCKLY_CONTROLLERS = [ResponsesConfigurationsController];
const MOCKLY_PROVIDERS = [ResponsesConfigService];

@Module({})
export class MocklyModule implements NestModule {

  static with(controllers: any[], providers: Provider[]): DynamicModule {
    return {
      module: MocklyModule,
      controllers: [...MOCKLY_CONTROLLERS, ...controllers],
      providers: [...MOCKLY_PROVIDERS, ...providers],
    };
  }

  configure(consumer: MiddlewareConsumer): MiddlewareConsumer {
    return consumer.apply(ResponseMiddleware).forRoutes('*');
  }
}
