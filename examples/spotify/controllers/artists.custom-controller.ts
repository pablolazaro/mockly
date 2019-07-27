import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  DatabaseRegistry,
  DocumentService,
  DocumentRepository
} from '@mockly/server';

@Controller('artist')
export class ArtistsCustomController {
  private readonly _service: DocumentService<any>;

  constructor(readonly registry: DatabaseRegistry) {
    this._service = new DocumentService<any>(
      new DocumentRepository<any>(registry.get('artists'))
    );
  }

  @Post()
  @HttpCode(201)
  async create(@Body() artist: any) {
    return await this._service.create(artist);
  }
}
