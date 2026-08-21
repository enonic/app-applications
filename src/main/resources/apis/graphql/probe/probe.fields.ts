import { Json, type GraphQLFields } from '/lib/graphql';

/**
 * ! Temporary, and being thrown away is the point of it. It proves the three things nothing else in
 * ! this app proves yet: that a POST reaches an extension controller with its body intact, that
 * ! lib-graphql executes under GraalJS from an extension endpoint, and that the `Json` scalar
 * ! survives the response serializer — declared in `types/graphql.d.ts` but used by no schema we
 * ! run. `config` and `phrases` replace it, and if `Json` turns out not to survive, `phrases`
 * ! becomes a list of key/value pairs instead.
 */
export const probeQueryFields: GraphQLFields = {
  probe: {
    type: Json,
    description: 'The app answering, so a caller can tell whose endpoint it reached.',
    resolve: () => ({ app: app.name, version: app.version }),
  },
};
