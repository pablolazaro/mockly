import { InjectDatabase } from './inject-database.decorator';

// https://github.com/nestjs/nest/blob/master/packages/common/constants.ts
export const PROPERTY_DEPS_METADATA = 'self:properties_metadata';

describe('InjectDatabase', () => {
  it('should decorate', () => {
    function EphimeralClass(database: any) {}

    InjectDatabase('artists')(EphimeralClass.constructor, 'database');

    const metadata = Reflect.getMetadata(
      PROPERTY_DEPS_METADATA,
      EphimeralClass.constructor
    );

    expect(metadata).toBeDefined();
    expect((metadata as any[]).find(item => item.type === 'ArtistsDatabase'));
  });
});
