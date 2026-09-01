import type { MarketApplication } from '../../../entities/market';
import {
  countMarketBuckets,
  filterMarketRows,
  type MarketBucket,
  type MarketBucketCounts,
} from './market-filter';
import { type MarketRow, searchMarketRows, sortMarketRows, toMarketRow } from './market-rows';

export type MarketView = {
  /** What each button reports: counted over the search result, whatever bucket is on. */
  counts: MarketBucketCounts;
  /** The same counts over the whole catalogue — the widest number each button will ever hold. */
  totals: MarketBucketCounts;
  rows: MarketRow[];
};

/**
 * The catalogue as the dialog shows it, in the one order that makes the buttons agree with the list: sort,
 * search, count, then narrow to the bucket. ! Counting after the bucket would leave every button reporting
 * the bucket already chosen.
 */
export function marketView(
  applications: readonly MarketApplication[],
  query: string,
  bucket: MarketBucket,
): MarketView {
  const sorted = sortMarketRows(applications.map(toMarketRow));
  const searched = searchMarketRows(sorted, query);

  return {
    counts: countMarketBuckets(searched),
    totals: countMarketBuckets(sorted),
    rows: filterMarketRows(searched, bucket),
  };
}
