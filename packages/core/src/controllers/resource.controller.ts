import {
  BadRequestException,
  Body,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put
} from '@nestjs/common';
import { DocumentService } from '../services/document.service';
import { getRandomId } from '../utils';

export class ResourceController<T> {
  constructor(
    readonly _resourceName: string,
    private readonly _service: DocumentService<T>
  ) {}

  @Get()
  async getAll() {
    return await this._service.getAll();
  }

  @Post()
  async create(@Body() body: any): Promise<PouchDB.Core.ExistingDocument<T>> {
    if (
      typeof body !== 'object' ||
      Object.getOwnPropertyNames(body).length === 0
    ) {
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
    if (
      typeof body !== 'object' ||
      Object.getOwnPropertyNames(body).length === 0
    ) {
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
