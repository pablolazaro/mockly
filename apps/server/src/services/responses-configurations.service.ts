import {
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { ResponseConfig } from '../models/response-config';
import { DatabaseRegistry } from './database-registry.service';

@Injectable()
export class ResponsesConfigurationsService {
  private db: PouchDB.Database<ResponseConfig>;

  constructor(private readonly registry: DatabaseRegistry) {
    this.db = registry.get('responses');
  }

  async all(): Promise<Array<PouchDB.Core.ExistingDocument<ResponseConfig>>> {
    const result = await this.db.allDocs({ include_docs: true });

    return result.rows.map(row => row.doc);
  }

  async get(
    id: string
  ): Promise<PouchDB.Core.ExistingDocument<ResponseConfig>> {
    try {
      return await this.db.get(id);
    } catch (e) {
      throw new NotFoundException();
    }
  }

  async update(id: string, doc: ResponseConfig) {
    const currentDoc = await this.get(id);

    const result = await this.db.put({ ...currentDoc, ...doc });

    if (result.ok) {
      return await this.get(result.id);
    } else {
      throw new InternalServerErrorException();
    }
  }
}
