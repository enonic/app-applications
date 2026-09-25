import type { MarketApplication } from '../../../entities/market';
import { type MarketRow, searchMarketRows, sortMarketRows, toMarketRow } from './market-rows';

/** The catalogue as the dialog shows it: sorted, then narrowed to what the search matches. */
export function marketView(applications: readonly MarketApplication[], query: string): MarketRow[] {
  return searchMarketRows(sortMarketRows(applications.map(toMarketRow)), query);
}
