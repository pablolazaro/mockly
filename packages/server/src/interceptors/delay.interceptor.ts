import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { delay } from 'rxjs/operators';
import { getConfiguration } from '../utils/configuration';

@Injectable()
export class DelayInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler) {
    const config = await getConfiguration();
    console.log('INTERCEPTORS', config.delay);
    return next.handle().pipe(delay(config.delay));
  }
}
