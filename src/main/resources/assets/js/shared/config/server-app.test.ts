import { afterEach, describe, expect, it } from 'vitest';

import type { Config } from './config';
import { $config, setConfig } from './config.store';
import { serverAppUrl } from './server-app';

const CONFIG = {
  appId: 'com.enonic.xp.app.applications',
  appVersion: '1.0.0',
  eventsUrl: '/_/admin:events',
  managedMode: false,
  serverAppUrl: '/_/server:app',
} satisfies Config;

afterEach(() => {
  $config.set(undefined);
});

describe('serverAppUrl', () => {
  it('joins the path onto the base its own server built', () => {
    setConfig(CONFIG);

    expect(serverAppUrl('start')).toBe('/_/server:app/start');
  });

  it('answers the base alone for the api addressed at its root', () => {
    setConfig(CONFIG);

    expect(serverAppUrl()).toBe('/_/server:app');
  });

  // The bootstrap fills the store before anything renders, so this is calling too early rather than
  // a state the section has to show.
  it('answers nothing before the configuration is read', () => {
    expect(serverAppUrl('start')).toBeUndefined();
  });
});
