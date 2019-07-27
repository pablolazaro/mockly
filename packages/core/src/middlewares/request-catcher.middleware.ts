import { NestMiddleware, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseConfig } from '../models/response-config';
import { DatabaseRegistry } from '../services/database-registry.service';
import { DocumentService } from '../services/document.service';
import { DocumentRepository } from '../repositories/document.repository';

@Injectable()
export class ResponseMiddleware implements NestMiddleware {
  private readonly _service: DocumentService<ResponseConfig>;

  constructor(readonly registry: DatabaseRegistry) {
    this._service = new DocumentService(
      new DocumentRepository<ResponseConfig>(registry.get('responses'))
    );
  }

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
