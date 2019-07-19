import { DataControllerFactory } from '../factories/data-controller.factory';
import { ResourceControllerFactory } from '../factories/resource-controller.factory';
import { ResourceType } from '../models/resource-type';
import { ResourceDefinition } from '../models/resource-definition';

export function getControllers(
  definitions: ResourceDefinition[],
  prefix = ''
): any[] {
  return definitions.map(def => {
    switch (def.type) {
      case ResourceType.REST_RESOURCE:
        return ResourceControllerFactory.createController(def.name, prefix);
      case ResourceType.JSON_DATA:
        return DataControllerFactory.createController(def.name, prefix);
    }
  });
}
