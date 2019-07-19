import { appendPrefix } from './common';

describe('Resources utils', () => {
  describe('appendPrefix', () => {
    it('should not append prefix when no prefix is passed', () => {
      expect(appendPrefix('cats', '')).toBe('cats');
    });

    it('should append prefix', () => {
      expect(appendPrefix('cats', '/v1')).toBe('/v1/cats');
    });
  });
});
