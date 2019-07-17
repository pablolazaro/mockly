import { Controller } from '@nestjs/common';
import { DatabaseRegistry } from '../services/database-registry.service';
import { appendPrefix, capitalizeFirstLetter } from '../utils/index';
import { DataController } from '../controllers/data.controller';

export class DataControllerFactory {
  /**
   * Creates a generic controller for a resource.
   * @param resourceName
   */
  static createController(resourceName: string, prefix: string = ''): any {

    @Controller(appendPrefix(resourceName, prefix))
    class EphimeralDataController extends DataController<any> {
      constructor (registry: DatabaseRegistry) { super(registry, resourceName); }
    }

    Object.defineProperty(EphimeralDataController, 'name', {
      value: `Mockly${capitalizeFirstLetter(resourceName)}Controller`,
    });

    return EphimeralDataController;

  }

}
