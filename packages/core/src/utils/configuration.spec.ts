import {
  getConfiguration,
  getConfigurationValidationErrors
} from './configuration';
import { DEFAULT_CONFIG } from '../constants';
import { MocklyConfig } from '../models';

describe('Configuration utils', () => {
  it('should get default configuration', async () => {
    const config = await getConfiguration();

    expect(config.delay).toEqual(DEFAULT_CONFIG.delay);
    expect(config.port).toEqual(DEFAULT_CONFIG.port);
    expect(config.prefix).toEqual(DEFAULT_CONFIG.prefix);
    expect(config.resourceFilesGlob).toEqual(DEFAULT_CONFIG.resourceFilesGlob);
    expect(config.responsesConfigGlob).toEqual(
      DEFAULT_CONFIG.responsesConfigGlob
    );
    expect(config.rewritesFilesGlob).toEqual(DEFAULT_CONFIG.rewritesFilesGlob);
  });

  it('should validate a valid configuration', async () => {
    const config = await getConfiguration();
    const errors = await getConfigurationValidationErrors(config);

    expect(errors).toHaveLength(0);
  });

  it('should validate an invalid configuration', async () => {
    const config = new MocklyConfig(
      null,
      700,
      3000,
      1 as any,
      null,
      null,
      null
    );
    const errors = await getConfigurationValidationErrors(config);

    expect(errors).toHaveLength(1);
  });
});
