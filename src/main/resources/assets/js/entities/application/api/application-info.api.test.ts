import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setGraphQlEndpoint } from '../../../shared/api';
import { fetchApplicationInfo } from './application-info.api';

// The section's own data plane, which `mount` sets from `host.baseUrl` rather than reading off a
// tool config: there is no page of ours to carry one.
const ENDPOINT = '/admin/tool/com.enonic.xp.app.applications/applications/graphql';

let sent: { query?: string; variables?: unknown } | undefined;

function respondWith(body: unknown): void {
  globalThis.fetch = vi.fn((_url: unknown, options?: { body?: string }) => {
    sent = JSON.parse(options?.body ?? '{}') as { query?: string; variables?: unknown };
    return Promise.resolve(new Response(JSON.stringify(body)));
  }) as unknown as typeof globalThis.fetch;
}

function item(name: string, description: string | null = null) {
  return { key: `com.enonic.app.booster:${name}`, name, displayName: name, description };
}

const EMPTY_LISTS = {
  contentTypes: [],
  mixins: [],
  formFragments: [],
  pages: [],
  parts: [],
  layouts: [],
  macros: [],
  tasks: [],
  adminTools: [],
  adminExtensions: [],
  apis: [],
};

describe('fetchApplicationInfo', () => {
  beforeEach(() => {
    setGraphQlEndpoint(ENDPOINT);
    sent = undefined;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps every list the schema returns', async () => {
    respondWith({
      data: {
        applicationInfo: {
          ...EMPTY_LISTS,
          contentTypes: [item('article', 'An article')],
          parts: [item('heading')],
          tasks: [item('invalidate')],
          adminTools: [{ ...item('dashboard'), url: '/admin/com.enonic.app.booster/dashboard' }],
          adminExtensions: [{ ...item('panel'), interfaces: ['contentstudio.contextpanel'] }],
          apis: [{ ...item('graphql'), documentationUrl: 'https://example.com/api' }],
          deploymentUrl: '/webapp/com.enonic.app.booster',
          idProvider: { mode: 'LOCAL', usedBy: [{ key: 'system', displayName: 'System' }] },
        },
      },
    });

    const result = await fetchApplicationInfo('com.enonic.app.booster');

    const info = result._unsafeUnwrap();
    expect(info?.contentTypes).toEqual([
      {
        key: 'com.enonic.app.booster:article',
        name: 'article',
        displayName: 'article',
        description: 'An article',
      },
    ]);
    expect(info?.parts[0]?.description).toBeUndefined();
    expect(info?.adminTools[0]?.url).toBe('/admin/com.enonic.app.booster/dashboard');
    expect(info?.adminExtensions[0]?.interfaces).toEqual(['contentstudio.contextpanel']);
    expect(info?.apis[0]?.documentationUrl).toBe('https://example.com/api');
    expect(info?.deploymentUrl).toBe('/webapp/com.enonic.app.booster');
    expect(info?.idProvider).toEqual({
      mode: 'LOCAL',
      usedBy: [{ key: 'system', displayName: 'System' }],
    });
  });

  it('turns the nulls the schema allows into absent fields', async () => {
    respondWith({
      data: { applicationInfo: { ...EMPTY_LISTS, deploymentUrl: null, idProvider: null } },
    });

    const result = await fetchApplicationInfo('com.enonic.app.fathom');

    const info = result._unsafeUnwrap();
    expect(info?.deploymentUrl).toBeUndefined();
    expect(info?.idProvider).toBeUndefined();
    expect(info?.macros).toEqual([]);
  });

  it('drops the mode of an id provider descriptor that declares none', async () => {
    respondWith({
      data: {
        applicationInfo: {
          ...EMPTY_LISTS,
          deploymentUrl: null,
          idProvider: { mode: null, usedBy: [] },
        },
      },
    });

    const result = await fetchApplicationInfo('com.enonic.app.oidc');

    expect(result._unsafeUnwrap()?.idProvider).toEqual({ mode: undefined, usedBy: [] });
  });

  it('resolves to undefined where no application answers to the key', async () => {
    respondWith({ data: { applicationInfo: null } });

    const result = await fetchApplicationInfo('com.example.absent');

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBeUndefined();
  });

  it('sends the key as a variable', async () => {
    respondWith({ data: { applicationInfo: null } });

    await fetchApplicationInfo('com.enonic.app.booster');

    expect(sent?.variables).toEqual({ key: 'com.enonic.app.booster' });
  });

  it('fails with the message a GraphQL error carries', async () => {
    respondWith({ errors: [{ message: 'No such field' }] });

    const result = await fetchApplicationInfo('com.enonic.app.booster');

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toBe('No such field');
  });
});
