import { useStore } from '@nanostores/preact';

import { $marketApplications, type MarketApplicationsState } from './market.store';
import type { MarketApplication } from './market.types';

export type MarketApplicationLookup = {
  /** The catalogue's status: an entry is read out of it rather than fetched by key. */
  status: MarketApplicationsState['status'];
  /**
   * Absent while the catalogue loads, and after it loaded without an entry under this key — the
   * market does not carry every installed application, so absent is an ordinary answer here.
   */
  marketApplication?: MarketApplication;
};

/** What the market offers for one installed application, keyed the same way XP keys it. */
export function useMarketApplication(key: string | undefined): MarketApplicationLookup {
  const { status, items } = useStore($marketApplications);

  return {
    status,
    marketApplication: key == null ? undefined : items.find((item) => item.key === key),
  };
}
