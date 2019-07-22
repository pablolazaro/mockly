import { DelayInterceptor } from './../interceptors/delay.interceptor';
import {
  BadRequestException,
  Body,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseInterceptors
} from '@nestjs/common';
import { DatabaseRegistry } from '../services/database-registry.service';
import { DocumentService } from '../services/document.service';
import { DocumentRepository } from '../repositories/document.repository';
import { getRandomId } from '../utils';

@UseInterceptors(DelayInterceptor)
export class ResourceController<T> {
  private readonly _service: DocumentService<T>;

  constructor(
    readonly _registry: DatabaseRegistry,
    readonly _resourceName: string
  ) {
    this._service = new DocumentService(
      new DocumentRepository<T>(this._registry.get(this._resourceName))
    );
  }

  @Get()
  async getAll() {
    return await this._service.getAll();
  }

  @Post()
  async create(@Body() body: any): Promise<PouchDB.Core.ExistingDocument<T>> {
    if (typeof body !== 'object') {
      throw new BadRequestException();
    } else {
      const id = getRandomId();
      return await this._service.create({ ...body, id });
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await this._service.getById(id, false);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: any
  ): Promise<PouchDB.Core.ExistingDocument<T>> {
    if (typeof body !== 'object') {
      throw new BadRequestException();
    } else {
      return await this._service.update({ ...body, id }, false);
    }
  }

  @HttpCode(204)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this._service.delete(id, false);
  }
}
