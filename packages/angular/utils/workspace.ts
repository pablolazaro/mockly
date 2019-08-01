import { experimental, workspaces } from '@angular-devkit/core';
import { Rule, SchematicsException, Tree } from '@angular-devkit/schematics';

/**
 * Utilities from @nrwl/workspace.
 *
 * Original code can be found in the following links:
 *
 * https://github.com/nrwl/nx/blob/master/packages/workspace/src/utils/fileutils.ts
 * https://github.com/nrwl/nx/blob/master/packages/workspace/src/utils/workspace.ts
 */

export function updateWorkspace(
  updater: (
    workspace: workspaces.WorkspaceDefinition
  ) => void | PromiseLike<void>
): Rule {
  return async (tree: Tree) => {
    const host = createHost(tree);

    const { workspace } = await workspaces.readWorkspace('/', host);

    const result = updater(workspace);

    if (result !== null && result !== undefined) {
      await result;
    }

    await workspaces.writeWorkspace(workspace, host);
  };
}

export function getWorkspaceConfig(
  tree: Tree
): experimental.workspace.WorkspaceSchema {
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

  return workspace;
}

function createHost(tree: Tree): workspaces.WorkspaceHost {
  return {
    async readFile(path: string): Promise<string> {
      const data = tree.read(path);
      if (!data) {
        throw new Error('File not found.');
      }

      return data.toString();
    },
    async writeFile(path: string, data: string): Promise<void> {
      return tree.overwrite(path, data);
    },
    async isDirectory(path: string): Promise<boolean> {
      // approximate a directory check
      return !tree.exists(path) && tree.getDir(path).subfiles.length > 0;
    },
    async isFile(path: string): Promise<boolean> {
      return tree.exists(path);
    }
  };
}
