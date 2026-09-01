import type { MarketRow } from './market-rows';

/** Which slice of the catalogue the dialog is showing. */
export type MarketBucket = 'all' | 'installed' | 'update';

export type MarketBucketCounts = Record<MarketBucket, number>;

export function isMarketBucket(value: string): value is MarketBucket {
  return value === 'all' || value === 'installed' || value === 'update';
}

export function filterMarketRows(rows: readonly MarketRow[], bucket: MarketBucket): MarketRow[] {
  return rows.filter((row) => inBucket(row, bucket));
}

/**
 * How many rows each bucket holds, counted over what it is given — the search result, so the numbers on the
 * buttons narrow with the search rather than reporting the whole catalogue.
 */
export function countMarketBuckets(rows: readonly MarketRow[]): MarketBucketCounts {
  const counts: MarketBucketCounts = { all: rows.length, installed: 0, update: 0 };

  for (const row of rows) {
    if (inBucket(row, 'installed')) {
      counts.installed += 1;
    }
    if (inBucket(row, 'update')) {
      counts.update += 1;
    }
  }

  return counts;
}

/**
 * The bucket to fall back to once the catalogue no longer holds one: `all`. ! It reads the totals, not the
 * counts — falling back on a keystroke would take the filter away as it is being used.
 */
export function fallbackBucket(bucket: MarketBucket, totals: MarketBucketCounts): MarketBucket {
  return totals[bucket] === 0 ? 'all' : bucket;
}

// *
// * Internal
// *

// One rule, read by both the filter and the counts, so a button can never disagree with its list.
function inBucket(row: MarketRow, bucket: MarketBucket): boolean {
  if (bucket === 'all') {
    return true;
  }
  // Anything this instance has, a dev build included: what is installed is the question, not whether
  // the market agrees with it.
  if (bucket === 'installed') {
    return row.installedVersion != null;
  }

  return row.status === 'update';
}
