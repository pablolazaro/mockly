import rc from 'rc';
import { validate, ValidationError } from 'class-validator';
import { MocklyConfig } from '../models/mockly-config';
import { DEFAULT_CONFIG } from '../constants';

/**
 * Gets Mockly configuration.
 */
export async function getConfiguration(): Promise<MocklyConfig> {
  const config = rc('mockly', DEFAULT_CONFIG);

  return new MocklyConfig(
    config.customControllersGlob,
    config.delay,
    config.port,
    config.prefix,
    config.resourceFilesGlob,
    config.rewritesFilesGlob,
    config.responsesConfigGlob
  );
}

export async function getConfigurationValidationErrors(
  config: MocklyConfig
): Promise<ValidationError[]> {
  return await validate(config);
}
