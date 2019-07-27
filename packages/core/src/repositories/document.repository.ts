export class DocumentRepository<T> {
  constructor(private readonly _database: PouchDB.Database<T>) {}

  async getById(id: string): Promise<PouchDB.Core.ExistingDocument<T>> {
    return await this._database.get<T>(id);
  }

  async getAll(): Promise<PouchDB.Core.ExistingDocument<T>[]> {
    const response = await this._database.allDocs<T>({ include_docs: true });

    return response.rows.map(row => row.doc);
  }

  async delete(
    doc: PouchDB.Core.RemoveDocument
  ): Promise<PouchDB.Core.Response> {
    return await this._database.remove(doc);
  }

  async create(doc: T): Promise<PouchDB.Core.Response> {
    return await this._database.post<T>(doc);
  }

  async update(
    doc: PouchDB.Core.ExistingDocument<T>
  ): Promise<PouchDB.Core.Response> {
    return await this._database.put(doc);
  }

  async find(
    query: PouchDB.Find.FindRequest<T>
  ): Promise<PouchDB.Find.FindResponse<T>> {
    return await this._database.find(query);
  }
}
