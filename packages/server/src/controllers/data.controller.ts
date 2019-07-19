import { Get, HttpCode, NotFoundException, Post } from '@nestjs/common';
import { DatabaseRegistry } from '../services/database-registry.service';

export class DataController<T> {
  private readonly _db: PouchDB.Database;

  constructor(
    private readonly _registry: DatabaseRegistry,
    private readonly _dataName: string
  ) {
    this._db = _registry.get('data');
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
    const find = await this._db.find({ selector: { name: { $eq: name } } });

    if (find.docs.length) {
      return (find.docs[0] as any).value;
    } else {
      throw new NotFoundException();
    }
  }
}
