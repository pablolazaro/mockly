import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler
} from '@nestjs/common';
import { delay } from 'rxjs/operators';
import { MocklyConfig } from '../models';

@Injectable()
export class DelayInterceptor implements NestInterceptor {
  constructor(private config: MocklyConfig) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(delay(this.config.delay));
  }
}
