import { describe, expect, it } from 'vitest';

import {
  countMarketBuckets,
  fallbackBucket,
  filterMarketRows,
  isMarketBucket,
  type MarketBucket,
} from './market-filter';
import type { MarketRow } from './market-rows';

function row(overrides: Partial<MarketRow> = {}): MarketRow {
  return {
    key: 'com.enonic.app.booster',
    displayName: 'Booster',
    availableVersion: '3.0.1',
    downloadUrl: 'https://repo.enonic.com/booster-3.0.1.jar',
    status: 'install',
    ...overrides,
  };
}

const notInstalled = row({ key: 'a', status: 'install' });
const updatable = row({ key: 'b', status: 'update', installedVersion: '2.1.0' });
const upToDate = row({ key: 'c', status: 'installed', installedVersion: '3.0.1' });
const devBuild = row({ key: 'd', status: 'ahead', installedVersion: '3.1.0-SNAPSHOT' });
const rows = [notInstalled, updatable, upToDate, devBuild];

function keys(bucket: MarketBucket): string[] {
  return filterMarketRows(rows, bucket).map(({ key }) => key);
}

describe('filterMarketRows', () => {
  it('keeps every row for the all bucket', () => {
    expect(keys('all')).toEqual(['a', 'b', 'c', 'd']);
  });

  it('keeps what this instance has, a dev build included', () => {
    expect(keys('installed')).toEqual(['b', 'c', 'd']);
  });

  it('keeps only what can be updated from the market', () => {
    expect(keys('update')).toEqual(['b']);
  });

  it('leaves the rows it was given untouched', () => {
    const given = [...rows];

    filterMarketRows(given, 'update');

    expect(given).toHaveLength(4);
  });
});

describe('countMarketBuckets', () => {
  it('counts each bucket over the rows it is given', () => {
    expect(countMarketBuckets(rows)).toEqual({ all: 4, installed: 3, update: 1 });
  });

  it('counts nothing for an empty list', () => {
    expect(countMarketBuckets([])).toEqual({ all: 0, installed: 0, update: 0 });
  });

  // The counts follow a search, so a narrowed list reports narrowed numbers.
  it('reports only what it was given, not the whole catalogue', () => {
    expect(countMarketBuckets([updatable])).toEqual({ all: 1, installed: 1, update: 1 });
  });
});

describe('fallbackBucket', () => {
  const totals = { all: 4, installed: 3, update: 0 };

  it('falls back to all where the catalogue no longer holds the bucket', () => {
    expect(fallbackBucket('update', totals)).toBe('all');
  });

  it('leaves a bucket the catalogue still holds', () => {
    expect(fallbackBucket('installed', totals)).toBe('installed');
  });

  // An empty catalogue has nothing to fall back to, and answering `all` is what stops a second look.
  it('answers all for all, whatever it holds', () => {
    expect(fallbackBucket('all', { all: 0, installed: 0, update: 0 })).toBe('all');
  });
});

describe('isMarketBucket', () => {
  it('accepts the three buckets', () => {
    expect(isMarketBucket('all')).toBe(true);
    expect(isMarketBucket('installed')).toBe(true);
    expect(isMarketBucket('update')).toBe(true);
  });

  // ToggleGroup answers with an empty string when the pressed button is pressed again.
  it('rejects anything else, the empty deselection included', () => {
    expect(isMarketBucket('')).toBe(false);
    expect(isMarketBucket('installed ')).toBe(false);
  });
});
