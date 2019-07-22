import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { ResponseConfig } from '../models';
import { DocumentService } from '../services/document.service';
import { DocumentRepository } from '../repositories/document.repository';
import { DatabaseRegistry } from '../services/database-registry.service';

@Controller('responses')
export class ResponsesConfigurationsController {
  private readonly _service: DocumentService<ResponseConfig>;

  constructor(readonly registry: DatabaseRegistry) {
    this._service = new DocumentService(
      new DocumentRepository<ResponseConfig>(registry.get('responses'))
    );
  }

  @Get()
  async all(): Promise<Array<ResponseConfig>> {
    return await this._service.getAll();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return await this._service.getById(id);
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  async update(@Param('id') id: string, @Body() config: ResponseConfig) {
    return await this._service.update({ ...config, _id: id });
  }
}
