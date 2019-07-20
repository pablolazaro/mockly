import { DelayInterceptor } from './../interceptors/delay.interceptor';
import {
  BadRequestException,
  Body,
  Delete,
  Get,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  UseInterceptors
} from '@nestjs/common';
import { DatabaseRegistry } from '../services/database-registry.service';
import { getRandomId } from '../utils';

@UseInterceptors(DelayInterceptor)
export class ResourceController<T> {
  private readonly _db: PouchDB.Database;

  constructor(
    readonly _registry: DatabaseRegistry,
    readonly _resourceName: string
  ) {
    this._db = this._registry.get(this._resourceName);
  }

  @Get()
  async getAll() {
    const docs = await this._db.allDocs({ include_docs: true });

    return docs.rows.map(row => row.doc);
  }

  @Post()
  async create(@Body() body: any): Promise<PouchDB.Core.ExistingDocument<T>> {
    if (typeof body !== 'object') {
      throw new BadRequestException();
    }

    const id = getRandomId();
    const result = await this._db.post({ ...body, id });

    if (result.ok) {
      return await this._getResource(id);
    } else {
      throw new InternalServerErrorException(result);
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const resource = await this._getResource(id);

    if (resource !== null && resource !== undefined) {
      return resource;
    } else {
      throw new NotFoundException();
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any
  ): Promise<PouchDB.Core.ExistingDocument<T>> {
    if (typeof body !== 'object') {
      throw new BadRequestException();
    }

    const resource = await this._getResource(id);

    if (resource !== null && resource !== undefined) {
      const result = await this._db.put({ ...resource, ...body });
      return await this._getResource(id);
    } else {
      throw new NotFoundException();
    }
  }

  @HttpCode(204)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const resource = await this._getResource(id);

    if (resource !== null && resource !== undefined) {
      const result = await this._db.remove(resource);

      if (result.ok) {
        return;
      } else {
        throw new InternalServerErrorException();
      }
    } else {
      throw new NotFoundException();
    }
  }

  private async _getResource(
    id: string
  ): Promise<PouchDB.Core.ExistingDocument<T>> {
    const result = await this._db.find({
      selector: {
        id: { $eq: id }
      }
    });

    return result.docs[0] as PouchDB.Core.ExistingDocument<T>;
  }
}
