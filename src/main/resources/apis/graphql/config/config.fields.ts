import type { GraphQLFields } from '/lib/graphql';
import { apiUrl } from '/lib/xp/portal';

import { ConfigType } from './config.types';

export const configQueryFields: GraphQLFields = {
  config: {
    type: ConfigType,
    description: "The section's own configuration, read in this application's context.",
    resolve: () => ({
      appId: app.name,
      appVersion: app.version,
      managedMode: isManagedMode(),
      eventsUrl: apiUrl({ api: 'admin:events' }),
      serverAppUrl: apiUrl({ api: 'server:app' }),
    }),
  },
};

/**
 * `managedMode`, not `applications.managedMode`: the prefix the host needed to tell one section's cfg from
 * another's is redundant inside this application's own `.cfg`.
 */
function isManagedMode(): boolean {
  return app.config['managedMode']?.trim() === 'true';
}
