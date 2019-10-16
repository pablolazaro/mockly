import { ResourceController } from '../controllers/resource.controller';
import { Controller, UseInterceptors } from '@nestjs/common';
import { DataController } from '../controllers/data.controller';
import { appendPrefix, capitalizeFirstLetter } from '../utils';
import { ControllerType } from '../models/controller-type';
import { DelayInterceptor } from '../interceptors/delay.interceptor';
import { InjectService } from '../decorators/inject-service.decorator';
import { DocumentService } from '../services';

export class ControllerFactory {
  static create(name: string, prefix: string, controllerType: ControllerType) {
    let controller = null;

    switch (controllerType) {
      case ControllerType.RESOURCE_CONTROLLER:
        controller = this.createFromParent(name, ResourceController);
        InjectService(name)(controller.prototype.constructor, '_service', 0);
        break;
      case ControllerType.DATA_CONTROLLER:
        controller = this.createFromParent(name, DataController);
        InjectService('data')(controller.prototype.constructor, '_service', 0);
        break;
    }

    Object.defineProperty(controller, 'name', {
      value: `Mockly${capitalizeFirstLetter(name)}Controller`
    });

    Controller(appendPrefix(name, prefix))(controller);
    UseInterceptors(DelayInterceptor)(controller);

    return controller;
  }

  private static createFromParent<T>(name: string, parent: any) {
    return class extends parent<T> {
      constructor(service: DocumentService<any>) {
        super(name, service);
      }
    };
  }
}
