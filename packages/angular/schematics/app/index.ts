import {
  apply,
  applyTemplates,
  chain,
  mergeWith,
  move,
  Rule,
  SchematicContext,
  Tree,
  url
} from '@angular-devkit/schematics';
import { normalize } from '@angular-devkit/core';
import { join } from 'path';
import { getWorkspaceConfig, updateWorkspace } from '../../utils/workspace';

export interface MocklyAppSchema {
  name: string;
  path: string;
}
export function app(_options: MocklyAppSchema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    let parentFolder = null;

    if (
      _options.path !== null &&
      _options.path !== undefined &&
      _options.path.length !== 0
    ) {
      parentFolder = _options.path;
    } else {
      const workspaceConfig = getWorkspaceConfig(tree);

      parentFolder = workspaceConfig.newProjectRoot || '';
    }

    const appPath = join(normalize(parentFolder), _options.name);

    return chain([
      addMocklyAppToWorkspace(_options.name, appPath),
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

function addMocklyAppToWorkspace(name: string, path: string): Rule {
  const project = createProjectDefinition(path);

  return updateWorkspace(workspace => {
    workspace.projects.add({
      name,
      ...project
    });
  });
}

function createProjectDefinition(path: string) {
  return {
    root: path,
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
  };
}
