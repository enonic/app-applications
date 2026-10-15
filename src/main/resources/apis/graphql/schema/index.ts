import type { GraphQLSchema } from '/lib/graphql';

import { generator } from './generator';
import { QueryType } from './query';

// ? Built once when the module is first required, not per request. No mutation type yet — this
// ? section reads only; writes arrive with the Applications screen itself.
export const schema: GraphQLSchema = generator.createSchema({ query: QueryType });
