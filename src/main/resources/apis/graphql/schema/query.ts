import { type GraphQLType } from '/lib/graphql';

import { configQueryFields } from '../config/config.fields';
import { phrasesQueryFields } from '../phrases/phrases.fields';
import { generator } from './generator';

export const QueryType: GraphQLType = generator.createObjectType({
  name: 'Query',
  description: 'Read access to everything the Applications section manages.',
  fields: {
    ...configQueryFields,
    ...phrasesQueryFields,
  },
});
