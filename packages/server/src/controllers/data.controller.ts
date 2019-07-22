import { DelayInterceptor } from './../interceptors/delay.interceptor';
import {
  Get,
  HttpCode,
  NotFoundException,
  Post,
  UseInterceptors
} from '@nestjs/common';
import { DatabaseRegistry } from '../services/database-registry.service';
import { DocumentService } from '../services/document.service';
import { DocumentRepository } from '../repositories/document.repository';

@UseInterceptors(DelayInterceptor)
export class DataController<T> {
  private readonly _service: DocumentService<T>;

  constructor(
    readonly _registry: DatabaseRegistry,
    private readonly _dataName: string
  ) {
    this._service = new DocumentService(
      new DocumentRepository<T>(this._registry.get('data'))
    );
  }

  @Get()
  async getData() {
    return await this._getData(this._dataName);
  }

  @Post()
  @HttpCode(200)
  async postData() {
    return await this._getData(this._dataName);
  }

  private async _getData(name: string) {
    const find = await this._service.find({
      selector: { name: { $eq: name } }
    });

    if (find.docs.length) {
      return (find.docs[0] as any).value;
    } else {
      throw new NotFoundException();
    }
  }
}
