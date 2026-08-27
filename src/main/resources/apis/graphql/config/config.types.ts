import { GraphQLBoolean, GraphQLString, nonNull, type GraphQLType } from '/lib/graphql';

import { generator } from '../schema/generator';

/**
 * What a standalone tool would have inlined into its own page as a JSON island. This section has no
 * page of its own — the shell renders it and the module is imported into that page — so the only
 * moment this app's server code runs is a request to its own endpoint. Hence a root field.
 */
export const ConfigType: GraphQLType = generator.createObjectType({
  name: 'Config',
  description: "Values the section needs from its own application's context.",
  fields: {
    appId: {
      type: nonNull(GraphQLString),
      description: 'This application, not the shell hosting it.',
    },
    appVersion: {
      type: nonNull(GraphQLString),
    },
    managedMode: {
      type: nonNull(GraphQLBoolean),
      description:
        'Whether this instance forbids installing and uninstalling applications from the UI.',
    },
  },
});
