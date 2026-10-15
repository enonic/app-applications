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
    expect(keys(marketView(applications, ''))).toEqual(['b', 'a', 'd', 'c']);
  });

  it('narrows to the search result, keeping the order', () => {
    expect(keys(marketView(applications, 'ada'))).toEqual(['a', 'd']);
  });

  it('answers an empty view where nothing matches the search', () => {
    expect(marketView(applications, 'nothing')).toEqual([]);
  });
});
