export class DatabaseRegistry {
  constructor(private readonly databases: Map<string, PouchDB.Database<any>>) {}

  get<T>(name: string): PouchDB.Database<T> {
    return this.databases.get(name);
  }
}
