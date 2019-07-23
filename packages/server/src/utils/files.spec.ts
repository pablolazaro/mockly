jest.mock('globby');
import globby from 'globby';

describe('Files utils', () => {
  beforeAll(() => jest.mock('fs'));
  afterAll(() => jest.dontMock('fs'));

  beforeEach(() => {
    require('fs').__setMockFiles({
      'examples/spotify/resources/artists.resource.json':
        '{"artists":[{"name":"Peter"}]}'
    });
  });

  afterEach(() => {
    require('fs').__clearMockFiles();
  });

  describe('getFilesContent', () => {
    it('should get files contents', async () => {
      const { getFilesContent } = require('./files');
      const content = await getFilesContent([
        'examples/spotify/resources/artists.resource.json'
      ]);

      expect(content).toBeDefined();
      expect(content[0].artists).toBeDefined();
      expect(content[0].artists).toHaveLength(1);
    });
  });

  describe('getFileContent', () => {
    it('should get file content', async () => {
      const { getFileContent } = require('./files');
      const content = await getFileContent(
        'examples/spotify/resources/artists.resource.json'
      );

      expect(content).toBeDefined();
      expect(content.artists).toBeDefined();
      expect(content.artists).toHaveLength(1);
    });
  });

  describe('findFiles', () => {
    it('shoud find files', async () => {
      (globby as any).mockReturnValue(Promise.resolve(['', '', '', '', '']));
      const { findFiles } = require('./files');
      const files = await findFiles('**');

      expect(files).toBeDefined();
      expect(files).toHaveLength(5);
    });
  });
});
