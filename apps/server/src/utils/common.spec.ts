import { appendPrefix, capitalizeFirstLetter, getRandomId } from './common';

describe('Common utils', () => {
  describe('capitalizeFirstLetter', () => {
    it('should capitalize', () => {
      expect(capitalizeFirstLetter('peter')).toBe('Peter');
    });

    it('should do nothing when nothing is passed', () => {
      expect(capitalizeFirstLetter('')).toBe('');
    });

    it('should throw an error when a non string value is passed', () => {
      expect(() => capitalizeFirstLetter(null)).toThrowError();
    });
  });

  describe('appendPrefix', () => {
    it('should not append prefix when no prefix is passed', () => {
      expect(appendPrefix('cats', '')).toBe('cats');
    });

    it('should append prefix', () => {
      expect(appendPrefix('cats', '/v1')).toBe('/v1/cats');
    });
  });

  describe('getRandomId', () => {
    it('should work', () => {
      expect(getRandomId()).toBeDefined();
    });
  });
});
