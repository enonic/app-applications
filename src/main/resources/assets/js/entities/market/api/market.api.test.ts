import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setGraphQlEndpoint } from '../../../shared/api';
import { fetchMarketApplications, MARKET_APPLICATIONS_ROOT } from './market.api';

// The section's own data plane, which `mount` sets from `host.baseUrl` rather than reading off a
// tool config: there is no page of ours to carry one.
const ENDPOINT = '/admin/tool/com.enonic.xp.app.applications/applications/graphql';

const guillotine = {
  key: 'com.enonic.app.guillotine',
  displayName: 'Guillotine',
  description: 'Augmentable GraphQL Content API for Enonic XP',
  iconUrl: 'https://market.enonic.com/_/media:attachment/market/guillotine/application.svg',
  pageUrl: 'https://market.enonic.com/vendors/enonic/guillotine',
  latest: {
    version: '8.0.0',
    downloadUrl: 'https://repo.enonic.com/public/guillotine-8.0.0.jar',
    sha512: '521cb05a',
    versionDate: '2026-06-05',
  },
  installedVersion: '7.3.4',
  updateAvailable: true,
  installedAhead: false,
};

function respondWith(body: unknown): void {
  globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(body)));
}

describe('fetchMarketApplications', () => {
  beforeEach(() => {
    setGraphQlEndpoint(ENDPOINT);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps the wire rows to market applications', async () => {
    respondWith({ data: { marketApplications: [guillotine] } });

    const result = await fetchMarketApplications();

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual([
      {
        key: 'com.enonic.app.guillotine',
        displayName: 'Guillotine',
        description: 'Augmentable GraphQL Content API for Enonic XP',
        iconUrl: 'https://market.enonic.com/_/media:attachment/market/guillotine/application.svg',
        pageUrl: 'https://market.enonic.com/vendors/enonic/guillotine',
        latest: {
          version: '8.0.0',
          downloadUrl: 'https://repo.enonic.com/public/guillotine-8.0.0.jar',
          sha512: '521cb05a',
          versionDate: '2026-06-05',
        },
        installedVersion: '7.3.4',
        updateAvailable: true,
        installedAhead: false,
      },
    ]);
  });

  it('reads an application the instance does not have as not installed', async () => {
    respondWith({
      data: {
        marketApplications: [{ ...guillotine, installedVersion: null, updateAvailable: false }],
      },
    });

    const [application] = (await fetchMarketApplications())._unsafeUnwrap();

    expect(application?.installedVersion).toBeUndefined();
    expect(application?.updateAvailable).toBe(false);
  });

  it('asks for the field with no arguments, so the transport names the operation', () => {
    expect(MARKET_APPLICATIONS_ROOT.field).toBe('marketApplications');
    expect(MARKET_APPLICATIONS_ROOT.args).toBeUndefined();
    expect(MARKET_APPLICATIONS_ROOT.variables).toBeUndefined();
  });

  it('asks for the newest release and leaves the version history on the server', () => {
    expect(MARKET_APPLICATIONS_ROOT.selection).toContain('latest');
    expect(MARKET_APPLICATIONS_ROOT.selection).not.toContain('versions');
  });

  it('fails with the message when the market could not be reached', async () => {
    respondWith({ errors: [{ message: 'Enonic Market answered 503 Service Unavailable' }] });

    const result = await fetchMarketApplications();

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toBe(
      'Enonic Market answered 503 Service Unavailable',
    );
  });

  it('fails rather than reading an empty catalogue out of a null field', async () => {
    respondWith({ data: { marketApplications: null } });

    expect((await fetchMarketApplications()).isErr()).toBe(true);
  });
});
