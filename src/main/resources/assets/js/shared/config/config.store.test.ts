import { afterEach, describe, expect, it } from 'vitest';

import type { Config } from './config';
import { $config, isManagedMode, setConfig } from './config.store';

function config(managedMode: boolean): Config {
  return {
    appId: 'com.enonic.xp.app.applications',
    appVersion: '1.0.0',
    eventsUrl: '/_/admin:events',
    managedMode,
    serverAppUrl: '/_/server:app',
  };
}

afterEach(() => {
  $config.set(undefined);
});

describe('isManagedMode', () => {
  it('answers what the installation configured', () => {
    setConfig(config(true));

    expect(isManagedMode()).toBe(true);
  });

  it('answers false for an installation that manages nothing', () => {
    setConfig(config(false));

    expect(isManagedMode()).toBe(false);
  });

  // The gates it guards are the ones that change what is installed, so an unread config has to read
  // as unmanaged rather than lock the section down — `App` does not render the section before then.
  it('answers false before the bootstrap has answered', () => {
    expect(isManagedMode()).toBe(false);
  });
});
