import { ResourceType } from '../models/resource-type';
import { ResourceDefinition } from '../models/resource-definition';
import { ControllerFactory } from '../factories/controller.factory';
import { ControllerType } from '../models/controller-type';
import { cwd } from 'process';
import { findFiles } from './files';
import { PATH_METADATA } from '../constants';

export function getControllers(
  definitions: ResourceDefinition[],
  prefix = ''
): any[] {
  return definitions.map(def => {
    switch (def.type) {
      case ResourceType.REST_RESOURCE:
        return ControllerFactory.create(
          def.name,
          prefix,
          ControllerType.RESOURCE_CONTROLLER
        );
      case ResourceType.JSON_DATA:
        return ControllerFactory.create(
          def.name,
          prefix,
          ControllerType.DATA_CONTROLLER
        );
    }
  });
}

export async function getCustomControllers(
  glob: string,
  workingDirectory = cwd()
) {
  const modulesFiles = await findFiles(glob, workingDirectory);
  const imports = modulesFiles.map(file => import(file));
  const modules = await Promise.all(imports);

  const controllers = modules.reduce((arr, module) => {
    const exports = Object.values(module);
    return [...arr, ...exports.filter(isNestController)];
  }, []);

  return controllers;
}

export async function isNestController(target: object) {
  const path = Reflect.getMetadata(PATH_METADATA, target);

  return path !== null && path !== undefined ? false : true;
}
