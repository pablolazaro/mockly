import { Inject } from '@nestjs/common';
import { capitalizeFirstLetter } from '../utils';

/**
 * Inject a Mockly resource service.
 *
 * @example
 * ```
 * constructor (@InjectService('artists') artists: DocumentService<any>) {}
 * ```
 * @param name Resource name
 * @constructor
 */
export const InjectService = (name: string) =>
  Inject(`${capitalizeFirstLetter(name)}Service`);
