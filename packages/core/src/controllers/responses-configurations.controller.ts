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
import { InjectService } from '../decorators/inject-service.decorator';

@Controller('responses')
export class ResponsesConfigurationsController {
  constructor(
    @InjectService('responses')
    private readonly _service: DocumentService<ResponseConfig>
  ) {}

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
