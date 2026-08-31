import { describe, expect, it } from 'vitest';

import type { MarketApplication } from '../../../entities/market';
import { marketView } from './market-view';

function application(overrides: Partial<MarketApplication> = {}): MarketApplication {
  return {
    key: 'com.enonic.app.booster',
    displayName: 'Booster',
    latest: { version: '3.0.1', downloadUrl: 'https://repo.enonic.com/booster-3.0.1.jar' },
    updateAvailable: false,
    installedAhead: false,
    ...overrides,
  };
}

const notInstalled = application({ key: 'a', displayName: 'Ada' });
const updatable = application({
  key: 'b',
  displayName: 'Booster',
  installedVersion: '2.1.0',
  updateAvailable: true,
});
const upToDate = application({ key: 'c', displayName: 'Chuck', installedVersion: '3.0.1' });
const devBuild = application({
  key: 'd',
  displayName: 'Ada Dev',
  installedVersion: '3.1.0-SNAPSHOT',
  installedAhead: true,
});
const applications = [notInstalled, updatable, upToDate, devBuild];

function keys(rows: readonly { key: string }[]): string[] {
  return rows.map(({ key }) => key);
}

describe('marketView', () => {
  it('sorts the updatable rows first, then by display name', () => {
    const { rows } = marketView(applications, '', 'all');

    expect(keys(rows)).toEqual(['b', 'a', 'd', 'c']);
  });

  it('counts every bucket over the whole catalogue when nothing is typed', () => {
    expect(marketView(applications, '', 'all').counts).toEqual({
      all: 4,
      installed: 3,
      update: 1,
    });
  });

  // The counts are what the buttons say, so they must not follow the button already pressed.
  it('counts the same whatever bucket is on, and narrows only the rows', () => {
    const all = marketView(applications, '', 'all');
    const update = marketView(applications, '', 'update');

    expect(update.counts).toEqual(all.counts);
    expect(keys(update.rows)).toEqual(['b']);
  });

  it('counts over the search result, so the numbers follow what is typed', () => {
    const { counts, rows } = marketView(applications, 'ada', 'all');

    expect(counts).toEqual({ all: 2, installed: 1, update: 0 });
    expect(keys(rows)).toEqual(['a', 'd']);
  });

  // The totals are what the buttons reserve room for, so a search must leave them alone — otherwise the
  // buttons resize under the pointer as the operator types.
  it('totals every bucket over the whole catalogue, whatever is typed', () => {
    const { totals } = marketView(applications, 'ada', 'update');

    expect(totals).toEqual({ all: 4, installed: 3, update: 1 });
  });

  it('answers an empty view where the search and the bucket cannot both be met', () => {
    const { counts, rows } = marketView(applications, 'ada', 'update');

    expect(counts.update).toBe(0);
    expect(rows).toEqual([]);
  });

  // A reload replaces the catalogue: an application that was updatable and is now current has to leave
  // the update bucket and its count.
  it('follows a reload that installed the update', () => {
    const installed = application({
      key: 'b',
      displayName: 'Booster',
      installedVersion: '3.0.1',
    });

    const { counts, rows } = marketView([notInstalled, installed], '', 'update');

    expect(counts).toEqual({ all: 2, installed: 1, update: 0 });
    expect(rows).toEqual([]);
  });
});
