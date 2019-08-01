import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { Tree } from '@angular-devkit/schematics';
import { join } from 'path';

/**
 * Utilities from @nrwl/workspace.
 *
 * Original code can be found in the following links:
 *
 * https://github.com/nrwl/nx/blob/master/packages/workspace/src/utils/fileutils.ts
 * https://github.com/nrwl/nx/blob/master/packages/workspace/src/utils/workspace.ts
 */

const testRunner = new SchematicTestRunner(
  '@mockly/angular',
  join(__dirname, '../collection.json')
);

export function runSchematic(schematicName: string, options: any, tree: Tree) {
  return testRunner.runSchematicAsync(schematicName, options, tree).toPromise();
}
