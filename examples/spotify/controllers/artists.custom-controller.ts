import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { DocumentService, InjectService } from '@mockly/core';

@Controller('artist')
export class ArtistsCustomController {
  constructor(
    @InjectService('artists') private readonly _service: DocumentService<any>
  ) {}

  @Post()
  @HttpCode(201)
  async create(@Body() artist: any) {
    return await this._service.create(artist);
  }
}
