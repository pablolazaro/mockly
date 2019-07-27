import { Injectable } from '@nestjs/common';
import { DatabaseRegistry } from './database-registry.service';
import { DocumentService } from './document.service';
import { DocumentRepository } from '../repositories/document.repository';

@Injectable()
export class DocumentServiceRegistry {
  constructor(private readonly _registry: DatabaseRegistry) {}

  get<T>(resource: string): DocumentService<T> {
    const db = this._registry.get<T>(resource);
    return new DocumentService<T>(new DocumentRepository<T>(db));
  }
}
