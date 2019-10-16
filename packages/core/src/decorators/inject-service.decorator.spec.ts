// https://github.com/nestjs/nest/blob/master/packages/common/constants.ts
import { InjectService } from './inject-service.decorator';

export const PROPERTY_DEPS_METADATA = 'self:properties_metadata';

describe('InjectService', () => {
  it('should decorate', () => {
    function EphimeralClass(database: any) {}

    InjectService('artists')(EphimeralClass.constructor, 'service');

    const metadata = Reflect.getMetadata(
      PROPERTY_DEPS_METADATA,
      EphimeralClass.constructor
    );

    expect(metadata).toBeDefined();
    expect((metadata as any[]).find(item => item.type === 'ArtistsService'));
  });
});
