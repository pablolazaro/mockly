import { getControllers } from './controllers';
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
});
