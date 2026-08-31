import { errAsync, okAsync } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Host } from '../shared/sections';

const { requestGraphQlRoots, setGraphQlEndpoint } = vi.hoisted(() => ({
  requestGraphQlRoots: vi.fn(),
  setGraphQlEndpoint: vi.fn(),
}));
const startSectionEvents = vi.hoisted(() => vi.fn());

vi.mock('../shared/api', () => ({ requestGraphQlRoots, setGraphQlEndpoint }));
vi.mock('./events', () => ({ startSectionEvents }));

const CONFIG = {
  appId: 'com.enonic.xp.app.applications',
  appVersion: '8.1.0',
  eventsUrl: '/_/admin:events',
  serverAppUrl: '/_/server:app',
};
const PHRASES = { 'applications.heading': 'Applications' };

const BASE_URL = '/admin/com.enonic.xp.app.settings/main/_/admin:extension/app:applications';

/** Only the two members the bootstrap reads; the rest of the contract is nothing to do with it. */
const host = (locale = 'en') => ({ baseUrl: BASE_URL, locale }) as unknown as Host;

function answers(data: unknown, message?: string) {
  requestGraphQlRoots.mockReturnValue(okAsync({ data, message }));
}

/**
 * The memo lives for the life of the module, which is the behaviour under test — so each case gets a
 * fresh module graph, and the stores it filled are read from that same graph.
 */
async function run(locale = 'en') {
  vi.resetModules();

  const [{ bootstrap }, { $bootstrap }, { $config }, { $phrases }] = await Promise.all([
    import('./bootstrap'),
    import('./bootstrap.store'),
    import('../shared/config'),
    import('../shared/i18n'),
  ]);

  await bootstrap(host(locale));

  return { bootstrap, $bootstrap, $config, $phrases };
}

beforeEach(() => {
  requestGraphQlRoots.mockReset();
  setGraphQlEndpoint.mockReset();
  startSectionEvents.mockReset();
  answers({ config: CONFIG, phrases: PHRASES });
});

describe('bootstrap', () => {
  it('fills both stores from one document', async () => {
    const { $bootstrap, $config, $phrases } = await run();

    expect($config.get()).toEqual(CONFIG);
    expect($phrases.get()).toEqual(PHRASES);
    expect($bootstrap.get()).toEqual({ status: 'ready' });
  });

  it('asks for the locale the shell resolved, as a variable', async () => {
    await run('no');

    const [roots, name, options] = requestGraphQlRoots.mock.calls[0] as [
      { field: string }[],
      string,
      { values: Record<string, unknown> },
    ];

    expect(roots.map((root) => root.field)).toEqual(['config', 'phrases']);
    expect(name).toBe('Bootstrap');
    expect(options.values).toEqual({ locale: 'no' });
  });

  it('runs once however often it is called, since the module outlives a mount', async () => {
    const { bootstrap } = await run();

    await bootstrap(host());
    await bootstrap(host());

    expect(requestGraphQlRoots).toHaveBeenCalledTimes(1);
  });

  it('fails when a root the section cannot start without came back null', async () => {
    answers({ config: null, phrases: PHRASES }, 'Field `config` blew up');

    const { $bootstrap, $config } = await run();

    expect($bootstrap.get()).toEqual({ status: 'error', error: 'Field `config` blew up' });
    expect($config.get()).toBeUndefined();
  });

  it('fails when the phrases payload is not a map of strings', async () => {
    answers({ config: CONFIG, phrases: { 'applications.heading': 42 } });

    const { $bootstrap, $phrases } = await run();

    expect($bootstrap.get().status).toBe('error');
    expect($phrases.get()).toEqual({});
  });

  it("points the transport at the section's own endpoint", async () => {
    await run();

    expect(setGraphQlEndpoint).toHaveBeenCalledWith(`${BASE_URL}/graphql`);
  });

  it("opens the event feed on the hub url the section's own schema answered with", async () => {
    await run();

    expect(startSectionEvents).toHaveBeenCalledExactlyOnceWith(CONFIG.eventsUrl);
  });

  it('leaves the event feed shut when the section never got its configuration', async () => {
    answers({ config: null, phrases: PHRASES }, 'Field `config` blew up');

    await run();

    expect(startSectionEvents).not.toHaveBeenCalled();
  });

  it('reports a request that rejected rather than leaving the section on its skeleton', async () => {
    requestGraphQlRoots.mockReturnValue({
      match: () => Promise.reject(new Error('Boom')),
    });

    const { $bootstrap } = await run();

    expect($bootstrap.get()).toEqual({ status: 'error', error: 'Boom' });
  });

  it('reports a request that failed outright', async () => {
    requestGraphQlRoots.mockReturnValue(errAsync(new Error('Network error')));

    const { $bootstrap } = await run();

    expect($bootstrap.get()).toEqual({ status: 'error', error: 'Network error' });
  });
});
