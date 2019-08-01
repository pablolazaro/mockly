/**
 * Utilities from @nrwl/workspace.
 *
 * Original code can be found in the following links:
 *
 * https://github.com/nrwl/nx/blob/master/packages/workspace/src/utils/fileutils.ts
 * https://github.com/nrwl/nx/blob/master/packages/workspace/src/utils/workspace.ts
 */
const stripJsonComments = require('strip-json-comments');
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';

export function updateJsonInTree<T = any, O = T>(
  path: string,
  callback: (json: T, context: SchematicContext) => O
): Rule {
  return (host: Tree, context: SchematicContext): Tree => {
    if (!host.exists(path)) {
      host.create(path, serializeJson(callback({} as T, context)));
      return host;
    }
    host.overwrite(
      path,
      serializeJson(callback(readJsonInTree(host, path), context))
    );
    return host;
  };
}

export function readJsonInTree<T = any>(host: Tree, path: string): T {
  if (host === null || host === undefined) {
    throw new Error('Host not available!');
  }
  if (!host.exists(path)) {
    throw new Error(`Cannot find ${path}`);
  }
  // tslint:disable-next-line:no-non-null-assertion
  const contents = stripJsonComments(host.read(path)!.toString('utf-8'));
  try {
    return JSON.parse(contents);
  } catch (e) {
    throw new Error(`Cannot parse ${path}: ${e.message}`);
  }
}

export function serializeJson(json: any): string {
  return `${JSON.stringify(json, null, 2)}\n`;
}
