import {
  getRewrites,
  getRewritesConfigurationErrors,
  getRewritesFiles
} from './rewrites';

jest.mock('./files');

import { findFiles, getFilesContent } from './files';
import { RewriteConfig } from '../models/rewrite-config';

(findFiles as any).mockReturnValue(['all.rewrites.json']);
(getFilesContent as any).mockReturnValue([{ '/api/v1/me': '/me' }]);

describe('Rewrites utils', () => {
  describe('getRewritesFiles', () => {
    it('should get rewrites files', async () => {
      const rewrites = await getRewritesFiles('**/*.rewrites.json');

      expect(rewrites).toBeDefined();
      expect(rewrites).toHaveLength(1);
    });
  });

  describe('getRewrites', () => {
    it('should get rewrites', async () => {
      const rewrites = await getRewrites('**/*.rewrites.json');

      expect(rewrites).toBeDefined();
      expect(rewrites).toHaveLength(1);
      expect(rewrites[0].from).toBe('/api/v1/me');
      expect(rewrites[0].to).toBe('/me');
    });
  });

  describe('getRewritesConfigurationErrors', () => {
    it('should validate valid rewrites', async () => {
      const rewrites = [new RewriteConfig('/api/v1/me', '/me')];
      const errors = await getRewritesConfigurationErrors(rewrites);

      expect(errors.every(arr => arr.length === 0)).toBe(true);
    });

    it('should validate empty rewrites', async () => {
      const rewrites = [new RewriteConfig('', '/me')];
      const errors = await getRewritesConfigurationErrors(rewrites);

      expect(errors.some(arr => arr.length !== 0)).toBe(true);
    });
  });
});
