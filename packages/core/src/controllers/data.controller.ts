import { Get, HttpCode, NotFoundException, Post } from '@nestjs/common';
import { DocumentService } from '../services/document.service';

export class DataController<T> {
  constructor(
    private readonly _dataName: string,
    private readonly _service: DocumentService<T>
  ) {}

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
