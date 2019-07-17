import { NestMiddleware, Injectable } from '@nestjs/common';
import { Request, Response } from 'express';
import { ResponseConfig } from '../models/response-config';
import { DatabaseRegistry } from '../services/database-registry.service';

@Injectable()
export class ResponseMiddleware implements NestMiddleware {
  private db: PouchDB.Database<ResponseConfig>;

  constructor(private readonly registry: DatabaseRegistry) {
    this.db = registry.get('responses');
  }

  async use(req: Request, res: Response, next: () => void) {
    const { baseUrl, method } = req;

    const result = await this.db.find({
      selector: {
        path: { $eq: baseUrl },
        method: { $eq: method },
      },
    });

    if (result.docs.length !== 0) {
      const responseConfig: ResponseConfig = result.docs[0];

      res.status(responseConfig.status).send(responseConfig.body);
    } else {
      next();
    }
  }
}
