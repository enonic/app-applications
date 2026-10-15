import { request } from '/lib/http-client';
import { getVersion } from '/lib/xp/admin';
import { list } from '/lib/xp/app';
import type { Application } from '@enonic-types/lib-app';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  absoluteUrl,
  compareVersions,
  coreVersion,
  keyOf,
  listMarketApplications,
  supportsXpVersion,
  toMarketApplications,
  xpVersionPattern,
  type MarketApplicationDto,
  type MarketVersionDto,
} from './market.source';

const ORIGIN = 'https://market.enonic.com';

function version(
  versionNumber: string,
  supported: string,
  overrides: Partial<MarketVersionDto> = {},
): MarketVersionDto {
  return {
    versionNumber,
    supportedVersions: [supported],
    sha512: null,
    versionDate: '2026-06-05',
    downloadUrl: `https://repo.enonic.com/public/${versionNumber}.jar`,
    ...overrides,
  };
}

type MarketData = NonNullable<MarketApplicationDto['data']>;

/** Guillotine as the market answers it, cut to the versions that decide the outcome. */
const guillotineData: MarketData = {
  version: [
    version('7.3.2', '7.14.0'),
    version('8.0.0', '8.0.0', { sha512: '521cb05a' }),
    version('7.3.4', '7.14.0'),
    version('1.0.0', '6.13.0'),
  ],
  icon: { attachmentUrl: `${ORIGIN}/_/media:attachment/market/guillotine/application.svg` },
  shortDescription: 'Augmentable GraphQL Content API for Enonic XP',
  identifier: 'com.enonic.app.guillotine',
  artifactId: 'guillotine',
  groupId: 'com.enonic.app',
};

const guillotine: MarketApplicationDto = {
  displayName: 'Guillotine',
  pageUrl: '/vendors/enonic/guillotine',
  data: guillotineData,
};

/** The same entry with one part of its data replaced. */
function withData(overrides: Partial<MarketData>): MarketApplicationDto {
  return { ...guillotine, data: { ...guillotineData, ...overrides } };
}

const context = { xpVersion: '8.1.0', installed: {}, origin: ORIGIN };

describe('compareVersions', () => {
  it('orders numerically rather than as text', () => {
    expect(compareVersions('8.0.0', '7.3.4')).toBe(1);
    expect(compareVersions('5.2.1', '6.0.0')).toBe(-1);
    expect(compareVersions('1.10.0', '1.9.0')).toBe(1);
  });

  it('reads a missing part as zero', () => {
    expect(compareVersions('1.0', '1.0.0')).toBe(0);
    expect(compareVersions('2', '1.9.9')).toBe(1);
  });

  it('puts a prerelease below its own release', () => {
    expect(compareVersions('8.1.0-SNAPSHOT', '8.1.0')).toBe(-1);
    expect(compareVersions('8.1.0', '8.1.0-RC1')).toBe(1);
    expect(compareVersions('8.2.0-SNAPSHOT', '8.1.0')).toBe(1);
  });

  it('reads a part that is not a number as zero instead of poisoning the comparison', () => {
    expect(compareVersions('1.x.0', '1.0.0')).toBe(0);
  });
});

describe('supportsXpVersion', () => {
  it('accepts a version whose declared minimum this XP meets', () => {
    expect(supportsXpVersion(['8.0.0'], '8.1.0')).toBe(true);
    expect(supportsXpVersion('7.14.0', '8.1.0')).toBe(true);
  });

  it('refuses a version needing an XP newer than this one', () => {
    expect(supportsXpVersion(['8.2.0'], '8.1.0')).toBe(false);
  });

  it('refuses a version declaring nothing at all', () => {
    expect(supportsXpVersion(null, '8.1.0')).toBe(false);
    expect(supportsXpVersion([], '8.1.0')).toBe(false);
  });

  it('accepts when any one of several minimums is met', () => {
    expect(supportsXpVersion(['9.0.0', '8.0.0'], '8.1.0')).toBe(true);
  });
});

describe('coreVersion and xpVersionPattern', () => {
  it('drops the build suffix the market never declares', () => {
    expect(coreVersion('8.1.0-SNAPSHOT')).toBe('8.1.0');
    expect(coreVersion('8.1.0')).toBe('8.1.0');
  });

  it('filters the market on the major alone', () => {
    expect(xpVersionPattern('8.1.0')).toBe('8.*');
  });
});

describe('keyOf', () => {
  it('takes the identifier the market publishes', () => {
    expect(keyOf(guillotine)).toBe('com.enonic.app.guillotine');
  });

  it('falls back to the build coordinates', () => {
    expect(keyOf(withData({ identifier: null }))).toBe('com.enonic.app.guillotine');
  });

  it('reads nothing from an entry carrying neither', () => {
    expect(keyOf(withData({ identifier: null, groupId: null }))).toBeUndefined();
  });
});

describe('absoluteUrl', () => {
  it('prefixes the origin onto a relative market url', () => {
    expect(absoluteUrl('/vendors/enonic/guillotine', ORIGIN)).toBe(
      `${ORIGIN}/vendors/enonic/guillotine`,
    );
  });

  it('leaves an absolute url alone', () => {
    expect(absoluteUrl(`${ORIGIN}/icon.svg`, ORIGIN)).toBe(`${ORIGIN}/icon.svg`);
  });

  it('reads nothing from a missing or empty url', () => {
    expect(absoluteUrl(null, ORIGIN)).toBeUndefined();
    expect(absoluteUrl('', ORIGIN)).toBeUndefined();
  });
});

describe('toMarketApplications', () => {
  it('offers the newest supported version whatever order the market listed them in', () => {
    const [application] = toMarketApplications([guillotine], context);

    expect(application?.latest.version).toBe('8.0.0');
    expect(application?.versions.map(({ version: v }) => v)).toEqual([
      '8.0.0',
      '7.3.4',
      '7.3.2',
      '1.0.0',
    ]);
  });

  it('keeps a version whose declared minimum is older than this XP', () => {
    // The pre-rewrite rule: a minimum is a minimum, so a 7-era release stays on offer.
    const [application] = toMarketApplications([guillotine], context);

    expect(application?.versions.some(({ version: v }) => v === '7.3.4')).toBe(true);
  });

  it('drops a version this XP is too old for', () => {
    const [application] = toMarketApplications([guillotine], { ...context, xpVersion: '7.15.0' });

    expect(application?.versions.map(({ version: v }) => v)).toEqual(['7.3.4', '7.3.2', '1.0.0']);
  });

  it('carries the checksum and the release date of each version', () => {
    const [application] = toMarketApplications([guillotine], context);

    expect(application?.latest).toEqual({
      version: '8.0.0',
      downloadUrl: 'https://repo.enonic.com/public/8.0.0.jar',
      sha512: '521cb05a',
      versionDate: '2026-06-05',
    });
  });

  it('survives a version the market published no checksum for', () => {
    const [application] = toMarketApplications([guillotine], { ...context, xpVersion: '7.15.0' });

    expect(application?.latest.sha512).toBeUndefined();
  });

  it('makes the page url absolute and leaves the icon url alone', () => {
    const [application] = toMarketApplications([guillotine], context);

    expect(application?.pageUrl).toBe(`${ORIGIN}/vendors/enonic/guillotine`);
    expect(application?.iconUrl).toBe(
      `${ORIGIN}/_/media:attachment/market/guillotine/application.svg`,
    );
  });

  it('reports an update when the installed version is older than the newest supported one', () => {
    const [application] = toMarketApplications([guillotine], {
      ...context,
      installed: { 'com.enonic.app.guillotine': '7.3.4' },
    });

    expect(application?.installedVersion).toBe('7.3.4');
    expect(application?.updateAvailable).toBe(true);
    expect(application?.installedAhead).toBe(false);
  });

  it('reports no update for an instance already on the newest version', () => {
    const [application] = toMarketApplications([guillotine], {
      ...context,
      installed: { 'com.enonic.app.guillotine': '8.0.0' },
    });

    expect(application?.updateAvailable).toBe(false);
    expect(application?.installedAhead).toBe(false);
  });

  it('reports an instance ahead of the market as such, with no update', () => {
    const [application] = toMarketApplications([guillotine], {
      ...context,
      installed: { 'com.enonic.app.guillotine': '8.1.0' },
    });

    expect(application?.updateAvailable).toBe(false);
    expect(application?.installedAhead).toBe(true);
  });

  it('reports nothing installed for an application this instance does not have', () => {
    const [application] = toMarketApplications([guillotine], context);

    expect(application?.installedVersion).toBeUndefined();
    expect(application?.updateAvailable).toBe(false);
    expect(application?.installedAhead).toBe(false);
  });

  it('drops an application with no version this XP can run', () => {
    expect(toMarketApplications([guillotine], { ...context, xpVersion: '6.0.0' })).toEqual([]);
  });

  it('drops a version the market gave no download url', () => {
    const entry = withData({
      version: [version('8.0.0', '8.0.0', { downloadUrl: null }), version('7.0.0', '7.0.0')],
    });

    expect(toMarketApplications([entry], context)[0]?.latest.version).toBe('7.0.0');
  });

  it('drops an entry it cannot key', () => {
    expect(toMarketApplications([withData({ identifier: null, groupId: null })], context)).toEqual(
      [],
    );
  });

  it('survives an entry the market sent no data with', () => {
    expect(
      toMarketApplications([{ displayName: 'Empty', pageUrl: null, data: null }], context),
    ).toEqual([]);
  });

  it('accepts a single version object where the market usually sends a list', () => {
    const entry = {
      ...guillotine,
      data: { ...guillotineData, version: version('8.0.0', '8.0.0') },
    };

    expect(toMarketApplications([entry], context)[0]?.latest.version).toBe('8.0.0');
  });

  it('falls back to the key where the market published no display name', () => {
    const entry: MarketApplicationDto = { ...guillotine, displayName: null };

    expect(toMarketApplications([entry], context)[0]?.displayName).toBe(
      'com.enonic.app.guillotine',
    );
  });

  it('sorts by display name, ignoring case', () => {
    const other: MarketApplicationDto = {
      ...withData({ identifier: 'systems.rcd.enonic.datatoolbox' }),
      displayName: 'data toolbox',
    };

    expect(toMarketApplications([guillotine, other], context).map(({ key }) => key)).toEqual([
      'systems.rcd.enonic.datatoolbox',
      'com.enonic.app.guillotine',
    ]);
  });
});

describe('listMarketApplications', () => {
  function application(key: string, appVersion: string): Application {
    return {
      key,
      version: appVersion,
      systemVersion: '8.1.0',
      minSystemVersion: null,
      maxSystemVersion: null,
      modifiedTime: '2026-07-30T10:00:00Z',
      started: true,
      system: false,
    };
  }

  function answer(body: unknown, status = 200): void {
    vi.mocked(request).mockReturnValue({
      status,
      message: 'OK',
      body: JSON.stringify(body),
      contentType: 'application/json',
      headers: {},
    });
  }

  beforeEach(() => {
    vi.stubGlobal('app', { name: 'com.enonic.xp.app.applications', version: '1.0.0', config: {} });
    vi.mocked(getVersion).mockReturnValue('8.1.0-SNAPSHOT');
    vi.mocked(list).mockReturnValue([]);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetAllMocks();
  });

  it('asks the market for this XP major, through variables rather than query text', () => {
    answer({ data: { market: { queryDsl: [guillotine] } } });

    listMarketApplications();

    const [params] = vi.mocked(request).mock.calls[0] ?? [];
    expect(params?.url).toBe('https://market.enonic.com/api/graphql');
    expect(params?.method).toBe('POST');
    expect(JSON.parse(params?.body ?? '{}')).toMatchObject({
      variables: { pattern: '8.*', first: 1000 },
    });
    expect(params?.body).not.toContain('8.*"}}');
  });

  it('compares against what this instance has installed', () => {
    vi.mocked(list).mockReturnValue([application('com.enonic.app.guillotine', '7.3.4')]);
    answer({ data: { market: { queryDsl: [guillotine] } } });

    const [found] = listMarketApplications();

    expect(found?.installedVersion).toBe('7.3.4');
    expect(found?.updateAvailable).toBe(true);
  });

  it('reads nothing from a market that answered no applications', () => {
    answer({ data: { market: { queryDsl: [] } } });

    expect(listMarketApplications()).toEqual([]);
  });

  it('fails with the status where the market refused the request', () => {
    answer({}, 503);

    expect(() => listMarketApplications()).toThrow('503');
  });

  it('fails with the message where the market reported an error', () => {
    answer({ errors: [{ message: 'Field type is not valid' }] });

    expect(() => listMarketApplications()).toThrow('Field type is not valid');
  });

  it('fails rather than reading an empty list out of an empty body', () => {
    vi.mocked(request).mockReturnValue({
      status: 200,
      message: 'OK',
      body: null,
      contentType: 'application/json',
      headers: {},
    });

    expect(() => listMarketApplications()).toThrow('empty body');
  });
});
