import {
  chain,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { updateJsonInTree } from '../../utils/files';
import { mocklyVersion } from '../../utils/versions';

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
      '@mockly/core': mocklyVersion
    };

    return { ...packageJson, devDependencies: updatedDevDependencies };
  });
}
