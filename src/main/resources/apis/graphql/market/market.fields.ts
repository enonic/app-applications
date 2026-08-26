import { list, nonNull, type GraphQLFields } from '/lib/graphql';

import { listMarketApplications } from './market.source';
import { MarketApplicationType } from './market.types';

export const marketQueryFields: GraphQLFields = {
  marketApplications: {
    type: list(nonNull(MarketApplicationType)),
    description: 'What Enonic Market offers.',
    resolve: () => listMarketApplications(),
  },
};
