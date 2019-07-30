import { Tree } from '@angular-devkit/schematics';
import { runSchematic } from '../../utils/testing';
import { update } from '@nrwl/workspace/src/command-line/update';

describe('ng add', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = Tree.empty();
  });

  it('should throw error in no package.json is present', async () => {
    try {
      await runSchematic('ng-add', {}, tree);
    } catch (e) {
      expect(e.message).toBe(
        'Unable to find package.json file in the current directory'
      );
    }
  });

  it('should add @mockl/core as dev dependency', async () => {
    tree.create('./package.json', JSON.stringify({ devDependencies: {} }));
    const updatedTree = await runSchematic('ng-add', {}, tree);

    const updatedPackageJson = JSON.parse(
      updatedTree.readContent('./package.json')
    );

    expect(updatedPackageJson.devDependencies).toBeDefined();
    expect(updatedPackageJson.devDependencies['@mockly/core']).toBeDefined();
  });
});
