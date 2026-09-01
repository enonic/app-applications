import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { Application, ApplicationState } from '../../../entities/application';
import { $config, type Config, setConfig } from '../../../shared/config';
import { isStartable, isStoppable, isUninstallable } from './application-lifecycle';

const OWN_APP = 'com.enonic.xp.app.applications';

const config = {
  appId: OWN_APP,
  appVersion: '1.0.0',
  eventsUrl: '/_/admin:events',
  managedMode: false,
  serverAppUrl: '/_/server:app',
} satisfies Config;

function application(
  key: string,
  state: ApplicationState,
  system = false,
  local = false,
): Application {
  return { key, displayName: key, version: '1.0.0', state, system, local };
}

beforeEach(() => {
  setConfig(config);
});

afterEach(() => {
  $config.set(undefined);
});

describe('isStartable', () => {
  it('accepts a stopped application, platform-bundled or not', () => {
    expect(isStartable(application('com.enonic.app.fathom', 'STOPPED'))).toBe(true);
    expect(isStartable(application('com.enonic.xp.app.system', 'STOPPED', true))).toBe(true);
  });

  it('refuses one that is already started', () => {
    expect(isStartable(application('com.enonic.app.booster', 'STARTED'))).toBe(false);
  });
});

describe('isStoppable', () => {
  it('accepts a started application of its own', () => {
    expect(isStoppable(application('com.enonic.app.booster', 'STARTED'))).toBe(true);
  });

  it('refuses one that is already stopped', () => {
    expect(isStoppable(application('com.enonic.app.fathom', 'STOPPED'))).toBe(false);
  });

  it('refuses a platform-bundled application', () => {
    expect(isStoppable(application('com.enonic.xp.app.system', 'STARTED', true))).toBe(false);
  });

  it('refuses the application this section is served from', () => {
    expect(isStoppable(application(OWN_APP, 'STARTED'))).toBe(false);
  });
});

describe('isUninstallable', () => {
  it('accepts an installed application whatever state it is in', () => {
    expect(isUninstallable(application('com.enonic.app.booster', 'STARTED'))).toBe(true);
    expect(isUninstallable(application('com.enonic.app.fathom', 'STOPPED'))).toBe(true);
  });

  it('refuses a platform-bundled application', () => {
    expect(isUninstallable(application('com.enonic.xp.app.system', 'STARTED', true))).toBe(false);
  });

  // XP throws for one of these, so an enabled button could only ever fail. On a development
  // instance every deployed application is local, which is what makes this the common case.
  it('refuses an application installed from the deploy directory', () => {
    expect(isUninstallable(application('com.enonic.app.features', 'STARTED', false, true))).toBe(
      false,
    );
  });

  // Refused by key, not only because this app happens to ship as a system app.
  it('refuses the application this section is served from', () => {
    expect(isUninstallable(application(OWN_APP, 'STARTED'))).toBe(false);
  });
});
