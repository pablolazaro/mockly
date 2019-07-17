import {
  Module,
  Provider,
  DynamicModule,
  NestModule,
  MiddlewareConsumer,
} from '@nestjs/common';
import { ResponsesConfigService } from '../services/response-config.service';
import { ResponsesConfigController } from '../controllers/response-config.controller';
import { ResponseMiddleware } from '../middlewares/request-catcher.middleware';

const MOCKLY_CONTROLLERS = [ResponsesConfigController];
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
