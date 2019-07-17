import { Controller } from '@nestjs/common';
import { DatabaseRegistry } from '../services/database-registry.service';
import { ResourceController } from '../controllers/resource.controller';
import { appendPrefix, capitalizeFirstLetter } from '../utils/index';

export class ResourceControllerFactory {
  /**
   * Creates a generic controller for a resource.
   * @param resourceName
   */
  static createController(resourceName: string, prefix: string = ''): any {

    @Controller(appendPrefix(resourceName, prefix))
    class EphimeralResourceController extends ResourceController<any> {
      constructor(registry: DatabaseRegistry) {
        super(registry, resourceName);
      }
    }

    Object.defineProperty(EphimeralResourceController, 'name', {
      value: `Mockly${capitalizeFirstLetter(resourceName)}Controller`,
    });

    return EphimeralResourceController;

  }
}
