import PouchDB from 'pouchdb';
import adapter from 'pouchdb-adapter-memory';
import find from 'pouchdb-find';

PouchDB.plugin(adapter);
PouchDB.plugin(find);

export function createDatabase<T>(name: string): PouchDB.Database<T> {
  return new PouchDB<T>(name, { adapter: 'memory' });
}

export async function hydrateDatabase(db: PouchDB.Database, resources: any[]) {
  return await db.bulkDocs(resources);
}
