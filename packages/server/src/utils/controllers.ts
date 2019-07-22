import { ResourceType } from '../models/resource-type';
import { ResourceDefinition } from '../models/resource-definition';
import { ControllerFactory } from '../factories/controller.factory';
import { ControllerType } from '../models/controller-type';

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
