import { ResourceController } from '../controllers/resource.controller';
import { Controller, Inject, UseInterceptors } from '@nestjs/common';
import { DatabaseRegistry } from '../services/database-registry.service';
import { DataController } from '../controllers/data.controller';
import { appendPrefix, capitalizeFirstLetter } from '../utils';
import { ControllerType } from '../models/controller-type';
import { DelayInterceptor } from '../interceptors/delay.interceptor';

export class ControllerFactory {
  static create(name: string, prefix: string, controllerType: ControllerType) {
    let controller = null;

    switch (controllerType) {
      case ControllerType.RESOURCE_CONTROLLER:
        controller = this.createFromParent(name, ResourceController);
        break;
      case ControllerType.DATA_CONTROLLER:
        controller = this.createFromParent(name, DataController);
        break;
    }

    Object.defineProperty(controller, 'name', {
      value: `Mockly${capitalizeFirstLetter(name)}Controller`
    });

    Controller(appendPrefix(name, prefix))(controller);
    UseInterceptors(DelayInterceptor)(controller);
    Inject(DatabaseRegistry)(controller.prototype.constructor, 'registry', 0);

    return controller;
  }

  private static createFromParent<T>(name: string, parent: any) {
    return class extends parent<T> {
      constructor(registry: DatabaseRegistry) {
        super(registry, name);
      }
    };
  }
}
