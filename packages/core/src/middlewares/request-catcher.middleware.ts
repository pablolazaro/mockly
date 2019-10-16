import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseConfig } from '../models/response-config';
import { DocumentService } from '../services/document.service';
import { InjectService } from '../decorators/inject-service.decorator';

@Injectable()
export class ResponseMiddleware implements NestMiddleware {
  constructor(
    @InjectService('responses')
    private readonly _service: DocumentService<ResponseConfig>
  ) {}

  async use(req: Request, res: Response, next: () => void) {
    const { baseUrl, method } = req;

    const result = await this._service.find({
      selector: {
        path: { $eq: baseUrl },
        method: { $eq: method }
      }
    });

    if (result.docs.length !== 0) {
      const responseConfig: ResponseConfig = result.docs[0];

      res.status(responseConfig.status).send(responseConfig.body);
    } else {
      next();
    }
  }
}
