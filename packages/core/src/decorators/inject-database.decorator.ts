import { Inject } from '@nestjs/common';
import { capitalizeFirstLetter } from '../utils';

/**
 * Inject a PouchDB Database.
 *
 * @example
 * ```
 * constructor (@InjectDatabase('artists') artists: PouchDB.Database) {}
 * ```
 * @param name Database name
 * @constructor
 */
export const InjectDatabase = (name: string) =>
  Inject(`${capitalizeFirstLetter(name)}Database`);
