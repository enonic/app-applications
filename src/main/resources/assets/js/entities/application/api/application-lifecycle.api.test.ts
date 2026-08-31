import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { $config, type Config, setConfig } from '../../../shared/config';
import {
  postStartApplications,
  postStopApplications,
  postUninstallApplications,
} from './application-lifecycle.api';

// The section's own configuration: its server builds the application api's url, the host hands over
// nothing of it.
const CONFIG = {
  appId: 'com.enonic.xp.app.applications',
  appVersion: '1.0.0',
  eventsUrl: '/_/admin:events',
  managedMode: false,
  serverAppUrl: '/_/server:app',
} satisfies Config;

function respondWith(body: unknown): void {
  globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(body)));
}

beforeEach(() => {
  setConfig(CONFIG);
});

afterEach(() => {
  $config.set(undefined);
  vi.restoreAllMocks();
});

describe('postStartApplications', () => {
  it('posts every key to the start url in one request', async () => {
    respondWith({ results: [{ id: 'a', success: true }] });

    await postStartApplications(['a', 'b']);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/_/server:app/start',
      expect.objectContaining({ method: 'POST', body: JSON.stringify({ key: ['a', 'b'] }) }),
    );
  });

  it('reports the keys whose action the server refused', async () => {
    respondWith({
      results: [
        { id: 'a', success: true },
        { id: 'b', success: false },
      ],
    });

    const result = await postStartApplications(['a', 'b']);

    expect(result._unsafeUnwrap()).toEqual({ failedKeys: ['b'] });
  });

  it('fails with the server-supplied message on an error status', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(new Response('{"message":"Forbidden"}', { status: 403 }));

    const result = await postStartApplications(['a']);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toBe('Forbidden');
  });

  it('fails before the request when the configuration is not read yet', async () => {
    $config.set(undefined);
    globalThis.fetch = vi.fn();

    const result = await postStartApplications(['a']);

    expect(result.isErr()).toBe(true);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe('postStopApplications', () => {
  it('posts to the stop url', async () => {
    respondWith({ results: [] });

    await postStopApplications(['a']);

    expect(globalThis.fetch).toHaveBeenCalledWith('/_/server:app/stop', expect.anything());
  });
});

describe('postUninstallApplications', () => {
  it('posts to the uninstall url', async () => {
    respondWith({ results: [] });

    await postUninstallApplications(['a']);

    expect(globalThis.fetch).toHaveBeenCalledWith('/_/server:app/uninstall', expect.anything());
  });

  // A deploy-directory application is refused per key, not per request: the UI cannot know it is
  // local, so this is the only place that failure shows up.
  it('reports a refused application as a failed key', async () => {
    respondWith({ results: [{ id: 'a', success: false }] });

    const result = await postUninstallApplications(['a']);

    expect(result._unsafeUnwrap()).toEqual({ failedKeys: ['a'] });
  });
});
