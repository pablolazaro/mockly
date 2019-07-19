import PouchDB from 'pouchdb';
import adapter from 'pouchdb-adapter-memory';
import find from 'pouchdb-find';

PouchDB.plugin(adapter);
PouchDB.plugin(find);

export function createDatabase(name: string): PouchDB.Database {
  return new PouchDB(name, { adapter: 'memory' });
}

export async function hydrateDatabase(db: PouchDB.Database, resources: any[]) {
  return await db.bulkDocs(resources);
}
