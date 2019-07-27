import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { DocumentRepository } from '../repositories/document.repository';

export class DocumentService<T> {
  constructor(private readonly _repository: DocumentRepository<T>) {}

  async getById(
    id: string,
    getByInternalId = true
  ): Promise<PouchDB.Core.ExistingDocument<T>> {
    try {
      return await this._getDocumentById(id, getByInternalId);
    } catch (error) {
      this._handleError(error);
    }
  }

  async getAll(): Promise<PouchDB.Core.ExistingDocument<T>[]> {
    try {
      return await this._repository.getAll();
    } catch (error) {
      this._handleError(error);
    }
  }

  async delete(id: string, deleteByInternalId = true) {
    try {
      const document = await this._getDocumentById(id, deleteByInternalId);

      await this._repository.delete(document);
    } catch (error) {
      this._handleError(error);
    }
  }

  async create(doc: T): Promise<PouchDB.Core.ExistingDocument<T>> {
    try {
      const result = await this._repository.create(doc);
      return await this._repository.getById(result.id);
    } catch (error) {
      this._handleError(error);
    }
  }

  async update(
    doc: T | PouchDB.Core.ExistingDocument<T>,
    updateByInternalId = true
  ) {
    try {
      const original = await this._getDocumentById(
        updateByInternalId
          ? (doc as PouchDB.Core.ExistingDocument<T>)._id
          : (doc as any).id,
        updateByInternalId
      );

      const response = await this._repository.update({ ...original, ...doc });

      return await this._getDocumentById(response.id, true);
    } catch (error) {
      this._handleError(error);
    }
  }

  async find(query: PouchDB.Find.FindRequest<T>) {
    try {
      return await this._repository.find(query);
    } catch (error) {
      this._handleError(error);
    }
  }

  private async _getDocumentById(
    id: string,
    isInternalId = true
  ): Promise<PouchDB.Core.ExistingDocument<T>> {
    let document = null;

    if (isInternalId) {
      document = await this._repository.getById(id);
    } else {
      const response = await this._repository.find({
        selector: { id: { $eq: id } }
      });

      if (response.docs && response.docs[0]) {
        document = response.docs[0];
      } else {
        throw new NotFoundException();
      }
    }

    return document;
  }

  private _handleError(error: PouchDB.Core.Error) {
    if (error instanceof HttpException) {
      throw error;
    } else {
      switch (error.status) {
        case 400:
          throw new BadRequestException(error.message);
        case 404:
          throw new NotFoundException(error.message);
          break;
        default:
          throw new InternalServerErrorException(error.message);
          break;
      }
    }
  }
}
