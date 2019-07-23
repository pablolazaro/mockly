import { getRewrites, getRewritesFiles } from './rewrites';

jest.mock('./files');

import { findFiles, getFilesContent } from './files';

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
      expect(rewrites).toHaveProperty('/api/v1/me');
    });
  });
});
