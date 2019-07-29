import {
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  SchematicsException,
  Tree,
  url
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { experimental, normalize } from '@angular-devkit/core';
import { join } from 'path';
import { updateWorkspace } from '@nrwl/workspace';
import { getWorkspace } from '@angular/cli/utilities/config';
import { ProjectType } from '@nrwl/workspace/src/command-line/affected-apps';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.

export interface MocklyAppSchema {
  name: string;
}
export function app(_options: MocklyAppSchema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const workspaceConfig = tree.read('/angular.json');

    if (!workspaceConfig) {
      throw new SchematicsException(
        'Could not find Angular workspace configuration'
      );
    }
    // convert workspace to string
    const workspaceContent = workspaceConfig.toString();

    // parse workspace string into JSON object
    const workspace: experimental.workspace.WorkspaceSchema = JSON.parse(
      workspaceContent
    );

    const appPath = join(
      normalize(workspace.newProjectRoot || ''),
      'apps',
      _options.name
    );

    return chain([
      addMocklyAppToWorkspace(_options.name),
      createMocklyAppFiles(appPath)
    ]);
  };
}

function createMocklyAppFiles(path: string): Rule {
  const templateSource = apply(url('./files'), [
    applyTemplates({}),
    move(path)
  ]);

  return mergeWith(templateSource);
}

function addMocklyAppToWorkspace(name: string): Rule {
  const project = createProjectDefinition(name);

  return updateWorkspace(workspace => {
    workspace.projects.add({
      name,
      ...project
    });
  });
}

function createProjectDefinition(name: string) {
  return {
    root: `apps/${name}`,
    sourceRoot: `apps/${name}/src`,
    projectType: 'application',
    architect: {
      serve: {
        builder: '@mockly/angular:start',
        options: {
          tsConfig: `apps/${name}/tsconfig.json`
        }
      }
    }
  };
}
