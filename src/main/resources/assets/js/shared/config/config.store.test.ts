import { afterEach, describe, expect, it } from 'vitest';

import type { Config } from './config';
import { $config, hasVirtualHosts, setConfig } from './config.store';

function config(overrides: Partial<Config> = {}): Config {
  return {
    appId: 'com.enonic.xp.app.applications',
    appVersion: '1.0.0',
    eventsUrl: '/_/admin:events',
    serverAppUrl: '/_/server:app',
    vhostsEnabled: false,
    ...overrides,
  };
}

afterEach(() => {
  $config.set(undefined);
});

describe('hasVirtualHosts', () => {
  it('answers what the installation maps', () => {
    setConfig(config({ vhostsEnabled: true }));

    expect(hasVirtualHosts()).toBe(true);
  });

  it('answers false for an installation mapping none', () => {
    setConfig(config({ vhostsEnabled: false }));

    expect(hasVirtualHosts()).toBe(false);
  });

  // Unread reads as unmapped, which is XP's own default — and the branch it picks is the one that
  // links the path, so a section rendering before the bootstrap would not degrade a dev install.
  it('answers false before the bootstrap has answered', () => {
    expect(hasVirtualHosts()).toBe(false);
  });
});
