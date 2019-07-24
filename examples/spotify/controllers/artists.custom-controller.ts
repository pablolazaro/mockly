import { Controller, HttpCode, Post } from '@nestjs/common';

@Controller('artist')
export class ArtistsCustomController {
  @Post()
  @HttpCode(201)
  create() {}
}
