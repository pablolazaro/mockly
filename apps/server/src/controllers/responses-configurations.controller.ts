import { Controller, Get, Param, Patch, Body, NotFoundException } from '@nestjs/common';
import { ResponseConfig } from '../models';
import { ResponsesConfigurationsService } from '../services/responses-configurations.service';

@Controller('responses')
export class ResponsesConfigurationsController {
  constructor(private readonly service: ResponsesConfigurationsService) {}

  @Get()
  async all(): Promise<
    Array<PouchDB.Core.ExistingDocument<ResponseConfig>>
    > {
    return await this.service.all();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const doc = await this.service.get(id);

    if (doc !== null && doc !== undefined) {
      return doc;
    } else {
      throw new NotFoundException();
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() config: ResponseConfig) {
    return await this.service.update(id, config);
  }
}
