import { GraphQLString } from '/lib/graphql';
import { describe, expect, it } from 'vitest';

import { ApplicationType } from './application.types';

// The lib-graphql double returns the builder's params as a plain object; a real type is opaque Java.
const { fields } = ApplicationType as unknown as { fields: Record<string, { resolve?: unknown }> };

describe('ApplicationType', () => {
  it('serves the system version range as lib-app reports it, a nullable string read off the source', () => {
    expect(fields.systemVersion).toMatchObject({ type: GraphQLString });
    expect(fields.systemVersion.resolve).toBeUndefined();
  });

  it('no longer serves the bounds that lose whether each is inclusive', () => {
    expect(fields).not.toHaveProperty('minSystemVersion');
    expect(fields).not.toHaveProperty('maxSystemVersion');
  });
});
