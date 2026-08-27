import { isLocalApplication } from '/lib/application';
import { GraphQLBoolean, GraphQLString, nonNull, type GraphQLType } from '/lib/graphql';

import { generator } from '../schema/generator';
import { displayNameOf, iconDataUriOf, type ApplicationSource } from './application.source';

export const ApplicationStateType: GraphQLType = generator.createEnumType({
  name: 'ApplicationState',
  description: 'Whether the application bundle is currently running.',
  values: ['STARTED', 'STOPPED'],
});

export const ApplicationType: GraphQLType = generator.createObjectType({
  name: 'Application',
  description: 'An application installed on this XP instance.',
  fields: {
    key: {
      type: nonNull(GraphQLString),
    },
    displayName: {
      type: nonNull(GraphQLString),
      description: 'Descriptor title, falling back to the key when the app declares none.',
      // TODO: Localize through titleI18nKey once the i18n bundle of the target app is read.
      resolve: (env: { source: ApplicationSource }) => displayNameOf(env.source),
    },
    description: {
      type: GraphQLString,
      resolve: (env: { source: ApplicationSource }) => env.source.descriptor?.description,
    },
    version: {
      type: GraphQLString,
    },
    state: {
      type: nonNull(ApplicationStateType),
      resolve: (env: { source: ApplicationSource }) => (env.source.started ? 'STARTED' : 'STOPPED'),
    },
    system: {
      type: nonNull(GraphQLBoolean),
      description: 'True for an application bundled with the platform.',
    },
    local: {
      type: nonNull(GraphQLBoolean),
      description:
        "True for an application installed from this instance's deploy directory. XP refuses to uninstall one.",
      resolve: (env: { source: ApplicationSource }) =>
        isLocalApplication({ application: env.source.key }),
    },
    modifiedTime: {
      type: GraphQLString,
      description: 'Closest thing XP records to an install date.',
    },
    icon: {
      type: GraphQLString,
      resolve: (env: { source: ApplicationSource }) => iconDataUriOf(env.source),
    },
    minSystemVersion: {
      type: GraphQLString,
    },
    maxSystemVersion: {
      type: GraphQLString,
    },
    vendorName: {
      type: GraphQLString,
      resolve: (env: { source: ApplicationSource }) => env.source.descriptor?.vendorName,
    },
    vendorUrl: {
      type: GraphQLString,
      resolve: (env: { source: ApplicationSource }) => env.source.descriptor?.vendorUrl,
    },
    url: {
      type: GraphQLString,
      resolve: (env: { source: ApplicationSource }) => env.source.descriptor?.url,
    },
  },
});
