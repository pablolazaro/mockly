import { SchematicsException, Tree } from '@angular-devkit/schematics';
import { runSchematic } from '../../utils/testing';
import { UnitTestTree } from '@angular-devkit/schematics/testing';

describe('app', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = Tree.empty();
  });

  it('should fail if no angular.json is present', async () => {
    try {
      await runSchematic('app', { name: 'myserver' }, tree);
    } catch (e) {
      expect((e as SchematicsException).message).toBe(
        'Could not find Angular workspace configuration'
      );
    }
  });

  it('should create app in newProjectsRoot folder', async () => {
    tree.create(
      './angular.json',
      JSON.stringify({
        $schema: './node_modules/@angular/cli/lib/config/schema.json',
        version: 1,
        newProjectRoot: 'projects',
        projects: {}
      })
    );

    const updatedTree = await runSchematic('app', { name: 'myserver' }, tree);

    checkProject(updatedTree, 'myserver', 'projects/myserver');
  });

  it('should create app in path option', async () => {
    tree.create(
      './angular.json',
      JSON.stringify({
        $schema: './node_modules/@angular/cli/lib/config/schema.json',
        version: 1,
        newProjectRoot: '',
        projects: {}
      })
    );

    const updatedTree = await runSchematic(
      'app',
      { name: 'myserver', path: 'apps' },
      tree
    );

    checkProject(updatedTree, 'myserver', 'apps/myserver');
  });
});

function checkProject(tree: UnitTestTree, name: string, path: string) {
  const updatedAngularJson = JSON.parse(tree.readContent('./angular.json'));

  expect(updatedAngularJson.projects[name]).toBeDefined();

  expect(updatedAngularJson.projects[name]).toStrictEqual({
    root: `${path}`,
    sourceRoot: `${path}/src`,
    projectType: 'application',
    architect: {
      serve: {
        builder: '@mockly/angular:start',
        options: {
          tsConfig: `${path}/tsconfig.json`
        }
      }
    }
  });

  expect(tree.exists(`./${path}/tsconfig.json`)).toBe(true);
  expect(tree.exists(`./${path}/src/responses.config.json`)).toBe(true);
  expect(tree.exists(`./${path}/src/data/me.json`)).toBe(true);
  expect(tree.exists(`./${path}/src/resources/albums.resource.json`)).toBe(
    true
  );
  expect(tree.exists(`./${path}/src/resources/artists.resource.json`)).toBe(
    true
  );
}
