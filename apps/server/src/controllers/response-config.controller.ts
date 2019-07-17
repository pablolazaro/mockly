import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { ResponsesConfigService } from '../services/response-config.service';
import { ResponseConfig } from '../models';

@Controller('responses')
export class ResponsesConfigController {
  constructor(private readonly service: ResponsesConfigService) {}

  @Get()
  async all(): Promise<
    Array<PouchDB.Core.ExistingDocument<ResponseConfig>>
    > {
    return await this.service.all();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const doc = await this.service.get(id);

    return doc ? doc : 404;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() config: ResponseConfig) {
    return await this.service.update(id, config);
  }
}
