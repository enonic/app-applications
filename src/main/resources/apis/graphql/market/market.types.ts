import { GraphQLBoolean, GraphQLString, list, nonNull, type GraphQLType } from '/lib/graphql';

import { generator } from '../schema/generator';

export const MarketApplicationVersionType: GraphQLType = generator.createObjectType({
  name: 'MarketApplicationVersion',
  fields: {
    version: {
      type: nonNull(GraphQLString),
    },
    downloadUrl: {
      type: nonNull(GraphQLString),
    },
    sha512: {
      type: GraphQLString,
    },
    versionDate: {
      type: GraphQLString,
    },
  },
});

export const MarketApplicationType: GraphQLType = generator.createObjectType({
  name: 'MarketApplication',
  fields: {
    key: {
      type: nonNull(GraphQLString),
    },
    displayName: {
      type: nonNull(GraphQLString),
    },
    description: {
      type: GraphQLString,
    },
    iconUrl: {
      type: GraphQLString,
    },
    pageUrl: {
      type: GraphQLString,
    },
    latest: {
      type: nonNull(MarketApplicationVersionType),
    },
    versions: {
      type: nonNull(list(nonNull(MarketApplicationVersionType))),
    },
    installedVersion: {
      type: GraphQLString,
    },
    updateAvailable: {
      type: nonNull(GraphQLBoolean),
    },
    installedAhead: {
      type: nonNull(GraphQLBoolean),
    },
  },
});
