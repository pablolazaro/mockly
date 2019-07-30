import {
  chain,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { updateJsonInTree } from '@nrwl/workspace';
import { readJsonFile } from '@angular-devkit/schematics/tools/file-system-utility';
import { join, normalize } from 'path';
import { JsonObject, JsonValue } from '@angular-devkit/core';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function ngAdd(_options: any): Rule {
  return chain([addInstallTask(), updatePackageJson()]);
}

export function addInstallTask() {
  return (host: Tree, context: SchematicContext) => {
    context.addTask(new NodePackageInstallTask());
    return host;
  };
}

export function updatePackageJson() {
  return updateJsonInTree('package.json', packageJson => {
    if (
      packageJson === null ||
      packageJson === undefined ||
      Object.keys(packageJson).length === 0
    ) {
      throw new SchematicsException(
        'Unable to find package.json file in the current directory'
      );
    }

    const devDependencies = packageJson.devDependencies || {};

    const updatedDevDependencies = {
      ...devDependencies,
      '@mockly/core': getMocklyVersion(),
      '@nrwl/workspace': getDependencyVersion('@nrwl/workspace')
    };

    return { ...packageJson, devDependencies: updatedDevDependencies };
  });
}

export function getMocklyVersion(): string {
  const packageJson: JsonValue = readJsonFile(
    normalize(join(__dirname, '..', '..', 'package.json'))
  );

  if (packageJson === null) {
    throw new SchematicsException(
      'Unable to find @mockly/angular package.json file'
    );
  } else {
    return (packageJson as JsonObject).version as string;
  }
}

export function getDependencyVersion(name: string): string {
  const packageJson: JsonValue = readJsonFile(
    normalize(join(__dirname, '..', '..', 'package.json'))
  );

  if (packageJson === null) {
    throw new SchematicsException(
      'Unable to find @mockly/angular package.json file'
    );
  } else {
    return (packageJson as any).peerDependencies[name] as string;
  }
}
