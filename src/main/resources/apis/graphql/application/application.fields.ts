import { GraphQLString, list, nonNull, type GraphQLFields } from '/lib/graphql';

import { applicationInfoSource } from './application-info.source';
import { ApplicationInfoType } from './application-info.types';
import { getApplication, listApplications } from './application.source';
import { ApplicationType } from './application.types';

export const applicationQueryFields: GraphQLFields = {
  application: {
    type: ApplicationType,
    description: 'One installed application, or null when no such application is installed.',
    args: {
      key: nonNull(GraphQLString),
    },
    resolve: (env: { args: { key: string } }) => getApplication(env.args.key),
  },
  applications: {
    type: list(nonNull(ApplicationType)),
    description: 'Every installed application, sorted by display name.',
    resolve: () => listApplications(),
  },
  applicationInfo: {
    type: ApplicationInfoType,
    description: 'What one application provides, or null when no such application is installed.',
    args: {
      key: nonNull(GraphQLString),
    },
    resolve: (env: { args: { key: string } }) => applicationInfoSource(env.args.key),
  },
};
