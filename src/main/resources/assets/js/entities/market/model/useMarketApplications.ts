import { useStore } from '@nanostores/preact';

import { $marketApplications, type MarketApplicationsState } from './market.store';

/** Everything the market offers for this XP. Started by `ensureMarketApplications()`, not by reading. */
export function useMarketApplications(): MarketApplicationsState {
  return useStore($marketApplications);
}
