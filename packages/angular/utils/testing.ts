import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { Tree } from '@angular-devkit/schematics';
import { join } from 'path';

const testRunner = new SchematicTestRunner(
  '@mockly/angular',
  join(__dirname, '../collection.json')
);

export function runSchematic(schematicName: string, options: any, tree: Tree) {
  return testRunner.runSchematicAsync(schematicName, options, tree).toPromise();
}
