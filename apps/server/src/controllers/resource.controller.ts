import { Body, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { DatabaseRegistry } from '../services/database-registry.service';

export class ResourceController {

  private readonly _db: PouchDB.Database;

  constructor (readonly _registry: DatabaseRegistry, readonly _resourceName: string) {
    this._db = this._registry.get(this._resourceName);
  }

  @Get()
  async getAll () {
    const docs = await this._db.allDocs({ include_docs: true });

    return docs.rows.map(row => row.doc);
  }

  @Post()
  async create(@Body() body: any) {
    return await this._db.post(body);
  }

  @Get(':id')
  async getOne (@Param() id: string) {
    return await this._getResource(id);
  }

  @Put(':id')
  async update (@Param() id: string, @Body() body: any) {
    const resource = this._getResource(id);
    const result = await this._db.put({ ...resource, ...body });
    return this._getResource(id);
  }

  @Delete(':id')
  async delete (@Param() id: string) {
    const document = await this._getResource(id);
    return await this._db.remove(document);
  }

  private async _getResource (id: string) {
    const result = await this._db.find({
      selector: {
        name: { $eq: id },
      },
    });

    return result.docs[0];
  }
}
