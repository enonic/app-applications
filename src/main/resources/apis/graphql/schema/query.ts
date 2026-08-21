import { type GraphQLType } from '/lib/graphql';

import { sectionQueryFields } from '../section/section.fields';
import { generator } from './generator';

export const QueryType: GraphQLType = generator.createObjectType({
  name: 'Query',
  description: 'Read access to everything the Applications section manages.',
  fields: {
    ...sectionQueryFields,
  },
});
