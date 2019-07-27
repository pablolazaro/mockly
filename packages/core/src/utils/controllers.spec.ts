import { getModulesAndFilterControllers } from './controllers';

jest.mock('./files');
jest.mock('./controllers');

import { findFiles } from './files';

import { Controller } from '@nestjs/common';

(findFiles as any).mockReturnValue(
  Promise.resolve([
    './first.custom-controller.ts',
    './second.custom-controller.ts',
    './third.custom-controller.ts'
  ])
);

const firstController = class {};
const secondController = class {};
const thirdController = class {};

Controller()(firstController);
Controller()(secondController);
Controller()(thirdController);

(getModulesAndFilterControllers as any).mockReturnValue(
  Promise.resolve([
    { a: true, b: 1, firstController: firstController },
    { a: false, b: 2, secondController: secondController },
    { a: 'TEXT', b: {}, thirdController: thirdController }
  ])
);

const {
  getControllers,
  isNestController,
  getCustomControllers
} = jest.requireActual('./controllers');

import { DataController } from '../controllers/data.controller';
import { ResourceController } from '../controllers/resource.controller';
import { ResourceDefinition } from '../models/resource-definition';
import { ResourceType } from '../models/resource-type';

describe('Controllers utils', () => {
  it('should create controllers', () => {
    const definitions: ResourceDefinition[] = [
      {
        name: 'First',
        type: ResourceType.JSON_DATA,
        resources: null
      },
      {
        name: 'Second',
        type: ResourceType.REST_RESOURCE,
        resources: null
      },
      {
        name: 'Third',
        type: ResourceType.JSON_DATA,
        resources: null
      }
    ];

    const controllers = getControllers(definitions);

    expect(controllers).toBeDefined();
    expect(controllers).toHaveLength(3);
    expect(controllers[0].prototype).toBeInstanceOf(DataController);
    expect(controllers[0].name).toBe('MocklyFirstController');
    expect(controllers[1].prototype).toBeInstanceOf(ResourceController);
    expect(controllers[1].name).toBe('MocklySecondController');
    expect(controllers[2].prototype).toBeInstanceOf(DataController);
    expect(controllers[2].name).toBe('MocklyThirdController');
  });

  describe('isNestController', () => {
    it('should check if the target is a Nest controller', () => {
      expect(isNestController({})).toBe(false);
      expect(isNestController(function() {})).toBe(false);
      expect(isNestController(class {})).toBe(false);

      const c = class {};
      Controller('')(c);
      expect(isNestController(c)).toBe(true);
    });
  });

  xdescribe('getCustomControllers', () => {
    it('should get custom controllers', async () => {
      const controllers = await getCustomControllers('');
      expect(controllers).toBeDefined();
      expect(controllers).toHaveLength(3);
    });
  });
});
