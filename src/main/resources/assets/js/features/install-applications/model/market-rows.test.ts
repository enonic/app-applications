import { describe, expect, it } from 'vitest';

import type { MarketApplication } from '../../../entities/market';
import {
  canInstall,
  isMajorUpdate,
  type MarketRow,
  searchMarketRows,
  sortMarketRows,
  toMarketRow,
} from './market-rows';

function marketApplication(overrides: Partial<MarketApplication> = {}): MarketApplication {
  return {
    key: 'com.enonic.app.booster',
    displayName: 'Booster',
    description: 'Caches rendered pages',
    iconUrl: 'https://market.enonic.com/icons/booster.svg',
    pageUrl: 'https://market.enonic.com/vendors/enonic/booster',
    latest: {
      version: '3.0.1',
      downloadUrl: 'https://repo.enonic.com/booster-3.0.1.jar',
      sha512: 'abc',
    },
    updateAvailable: false,
    installedAhead: false,
    ...overrides,
  };
}

function row(overrides: Partial<MarketRow> = {}): MarketRow {
  return {
    key: 'com.enonic.app.booster',
    displayName: 'Booster',
    availableVersion: '1.0.0',
    downloadUrl: 'https://repo.enonic.com/booster-1.0.0.jar',
    status: 'install',
    ...overrides,
  };
}

describe('toMarketRow', () => {
  it('carries the market entry over with the latest version as the available one', () => {
    expect(toMarketRow(marketApplication())).toEqual({
      key: 'com.enonic.app.booster',
      displayName: 'Booster',
      description: 'Caches rendered pages',
      iconUrl: 'https://market.enonic.com/icons/booster.svg',
      pageUrl: 'https://market.enonic.com/vendors/enonic/booster',
      availableVersion: '3.0.1',
      installedVersion: undefined,
      downloadUrl: 'https://repo.enonic.com/booster-3.0.1.jar',
      sha512: 'abc',
      status: 'install',
    });
  });

  it('reads an application this instance does not have as installable', () => {
    const { status } = toMarketRow(marketApplication({ installedVersion: undefined }));

    expect(status).toBe('install');
  });

  it('reads an installed application the market has something newer for as updatable', () => {
    const { status } = toMarketRow(
      marketApplication({ installedVersion: '2.1.0', updateAvailable: true }),
    );

    expect(status).toBe('update');
  });

  it('reads an installed application on the latest version as installed', () => {
    const { status } = toMarketRow(
      marketApplication({ installedVersion: '3.0.1', updateAvailable: false }),
    );

    expect(status).toBe('installed');
  });

  it('reads an installed version newer than the market offers as a dev build', () => {
    const { status } = toMarketRow(
      marketApplication({
        installedVersion: '3.1.0-SNAPSHOT',
        updateAvailable: false,
        installedAhead: true,
      }),
    );

    expect(status).toBe('ahead');
  });
});

describe('canInstall', () => {
  it('answers yes for anything not already on the latest version', () => {
    expect(canInstall(row({ status: 'install' }))).toBe(true);
    expect(canInstall(row({ status: 'update' }))).toBe(true);
  });

  it('answers no for an application on the latest version', () => {
    expect(canInstall(row({ status: 'installed' }))).toBe(false);
  });

  it('answers no for a dev build, which the market could only downgrade', () => {
    expect(canInstall(row({ status: 'ahead' }))).toBe(false);
  });
});

describe('isMajorUpdate', () => {
  it('answers yes when the major version goes up', () => {
    expect(
      isMajorUpdate(
        row({ status: 'update', installedVersion: '2.1.0', availableVersion: '3.0.1' }),
      ),
    ).toBe(true);
  });

  it('answers no for a minor or patch update', () => {
    expect(
      isMajorUpdate(
        row({ status: 'update', installedVersion: '3.0.1', availableVersion: '3.1.0' }),
      ),
    ).toBe(false);
    expect(
      isMajorUpdate(
        row({ status: 'update', installedVersion: '3.0.1', availableVersion: '3.0.2' }),
      ),
    ).toBe(false);
  });

  it('answers no for a first install, which replaces nothing', () => {
    expect(isMajorUpdate(row({ status: 'install', availableVersion: '3.0.1' }))).toBe(false);
  });

  it('answers no where either version does not start with a number', () => {
    expect(
      isMajorUpdate(
        row({ status: 'update', installedVersion: 'snapshot', availableVersion: '3.0.1' }),
      ),
    ).toBe(false);
    expect(
      isMajorUpdate(
        row({ status: 'update', installedVersion: '2.1.0', availableVersion: 'latest' }),
      ),
    ).toBe(false);
  });
});

describe('sortMarketRows', () => {
  function rows(): MarketRow[] {
    return [
      row({ key: 'a', displayName: 'Ada', status: 'installed' }),
      row({ key: 'b', displayName: 'zeta', status: 'install' }),
      row({ key: 'c', displayName: 'Nord', status: 'update' }),
      row({ key: 'd', displayName: 'Booster', status: 'update' }),
    ];
  }

  function names(sorted: readonly MarketRow[]): string[] {
    return sorted.map(({ displayName }) => displayName);
  }

  it('puts the applications with an update first, each group by name', () => {
    expect(names(sortMarketRows(rows()))).toEqual(['Booster', 'Nord', 'Ada', 'zeta']);
  });

  // Nothing separates them: an application on the latest version sorts among the installable ones.
  it('leaves installed and installable interleaved, and reads case as equal', () => {
    const sorted = sortMarketRows([
      row({ key: 'a', displayName: 'zeta', status: 'installed' }),
      row({ key: 'b', displayName: 'Ada', status: 'install' }),
      row({ key: 'c', displayName: 'nord', status: 'installed' }),
    ]);

    expect(names(sorted)).toEqual(['Ada', 'nord', 'zeta']);
  });

  // Two vendors can publish the same name; without the tie-break the rows would swap between renders.
  it('breaks a shared display name by key', () => {
    const sorted = sortMarketRows([
      row({ key: 'second', displayName: 'Booster' }),
      row({ key: 'first', displayName: 'Booster' }),
    ]);

    expect(sorted.map(({ key }) => key)).toEqual(['first', 'second']);
  });

  it('leaves the rows it was given untouched', () => {
    const given = rows();

    sortMarketRows(given);

    expect(names(given)).toEqual(['Ada', 'zeta', 'Nord', 'Booster']);
  });
});

describe('searchMarketRows', () => {
  const booster = row({ displayName: 'Booster', description: 'Caches rendered pages' });
  const fathom = row({ key: 'com.enonic.app.fathom', displayName: 'Fathom' });
  const rows = [booster, fathom];

  it('returns every row for an empty or blank query', () => {
    expect(searchMarketRows(rows, '')).toEqual(rows);
    expect(searchMarketRows(rows, '   ')).toEqual(rows);
  });

  it('matches the display name whatever the case', () => {
    expect(searchMarketRows(rows, 'BOOSTER')).toEqual([booster]);
  });

  it('matches the description', () => {
    expect(searchMarketRows(rows, 'rendered')).toEqual([booster]);
  });

  it('leaves the key out of the search', () => {
    expect(searchMarketRows(rows, 'com.enonic')).toEqual([]);
  });

  it('returns nothing when nothing matches', () => {
    expect(searchMarketRows(rows, 'guillotine')).toEqual([]);
  });
});
