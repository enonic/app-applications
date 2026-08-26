import type { GraphQLFields } from '/lib/graphql';

import { ConfigType } from './config.types';

export const configQueryFields: GraphQLFields = {
  config: {
    type: ConfigType,
    description: "The section's own configuration, read in this application's context.",
    resolve: () => ({ appId: app.name, appVersion: app.version }),
  },
};
