import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { delay } from 'rxjs/operators';
import { getConfiguration } from '../utils/configuration';
import { MocklyConfig } from '../models';

@Injectable()
export class DelayInterceptor implements NestInterceptor {
  constructor(private config: MocklyConfig) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const config = await getConfiguration();
    return next.handle().pipe(delay(this.config.delay));
  }
}
