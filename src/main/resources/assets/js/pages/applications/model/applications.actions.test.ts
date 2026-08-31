import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  type Application,
  type ApplicationState,
  startApplications,
  stopApplications,
} from '../../../entities/application';
import { $installDialogOpen, closeInstallDialog } from '../../../features/install-applications';
import { $uninstallTargets, closeUninstallDialog } from '../../../features/uninstall-applications';
import { $config, type Config, setConfig } from '../../../shared/config';
import type { ActionContext, SectionAction } from '../../../widgets/browse-toolbar/actions';
import { APPLICATION_ACTIONS } from './applications.actions';

vi.mock('../../../entities/application', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../entities/application')>()),
  startApplications: vi.fn(),
  stopApplications: vi.fn(),
}));

const OWN_APP = 'com.enonic.xp.app.applications';

const config = {
  appId: OWN_APP,
  appVersion: '1.0.0',
  eventsUrl: '/_/admin:events',
  serverAppUrl: '/_/server:app',
  managedMode: false,
} satisfies Config;

function application(
  key: string,
  state: ApplicationState,
  system = false,
  local = false,
): Application {
  return { key, displayName: key, version: '1.0.0', state, system, local };
}

const booster = application('com.enonic.app.booster', 'STARTED');
const fathom = application('com.enonic.app.fathom', 'STOPPED');
const systemApp = application('com.enonic.xp.app.system', 'STARTED', true);
const ownApp = application(OWN_APP, 'STARTED');
const localApp = application('com.enonic.app.features', 'STARTED', false, true);

function context(overrides: Partial<ActionContext<Application>> = {}): ActionContext<Application> {
  return { selected: [], active: undefined, ...overrides };
}

function action(id: string): SectionAction<Application> {
  const found = APPLICATION_ACTIONS.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`No application action with id ${id}`);
  }
  return found;
}

beforeEach(() => {
  setConfig(config);
  vi.mocked(startApplications).mockReset();
  vi.mocked(stopApplications).mockReset();
  closeUninstallDialog();
  closeInstallDialog();
});

afterEach(() => {
  $config.set(undefined);
});

describe('application actions', () => {
  it('offers install, uninstall, start and stop in that order', () => {
    expect(APPLICATION_ACTIONS.map(({ id }) => id)).toEqual([
      'install',
      'uninstall',
      'start',
      'stop',
    ]);
  });
});

describe('install application', () => {
  it('needs no target, since nothing on the list is what it installs', () => {
    expect(action('install').enabled(context())).toBe(true);
    expect(action('install').enabled(context({ selected: [booster] }))).toBe(true);
  });

  it('opens the install dialog', () => {
    void action('install').run(context());

    expect($installDialogOpen.get()).toBe(true);
  });
});

describe('uninstall application', () => {
  it('needs a target', () => {
    expect(action('uninstall').enabled(context())).toBe(false);
  });

  it('accepts a target in either state, ticked or merely active', () => {
    expect(action('uninstall').enabled(context({ selected: [booster, fathom] }))).toBe(true);
    expect(action('uninstall').enabled(context({ active: fathom }))).toBe(true);
  });

  it('refuses a platform application, and this tool with it', () => {
    expect(action('uninstall').enabled(context({ selected: [systemApp] }))).toBe(false);
    expect(action('uninstall').enabled(context({ selected: [ownApp] }))).toBe(false);
  });

  // The reason `local` is on the schema at all: XP refuses a deploy-directory application, so an
  // enabled button could only ever fail.
  it('refuses applications installed from the deploy directory', () => {
    expect(action('uninstall').enabled(context({ selected: [localApp] }))).toBe(false);
    expect(action('uninstall').enabled(context({ selected: [booster, localApp] }))).toBe(false);
  });

  // The one place Uninstall parts company with Start and Stop: it refuses the mixed selection
  // outright rather than acting on the half it may take.
  it('refuses a mixed selection instead of uninstalling part of it', () => {
    expect(action('uninstall').enabled(context({ selected: [booster, systemApp] }))).toBe(false);
  });

  it('asks before uninstalling anything', () => {
    const ctx = context({ selected: [booster, fathom] });

    void action('uninstall').run(ctx);

    expect($uninstallTargets.get()).toEqual([booster, fathom]);
  });
});

describe('start application', () => {
  it('needs a target', () => {
    expect(action('start').enabled(context())).toBe(false);
  });

  it('starts a stopped target, ticked or merely active', () => {
    expect(action('start').enabled(context({ selected: [fathom] }))).toBe(true);
    expect(action('start').enabled(context({ active: fathom }))).toBe(true);
  });

  it('refuses one that is already started', () => {
    expect(action('start').enabled(context({ selected: [booster] }))).toBe(false);
  });

  it('starts only the stopped ones out of a mixed selection', () => {
    const ctx = context({ selected: [booster, fathom] });

    expect(action('start').enabled(ctx)).toBe(true);
    void action('start').run(ctx);

    expect(startApplications).toHaveBeenCalledWith([fathom]);
  });
});

describe('stop application', () => {
  it('needs a target', () => {
    expect(action('stop').enabled(context())).toBe(false);
  });

  it('stops a started target, ticked or merely active', () => {
    expect(action('stop').enabled(context({ selected: [booster] }))).toBe(true);
    expect(action('stop').enabled(context({ active: booster }))).toBe(true);
  });

  it('refuses one that is already stopped', () => {
    expect(action('stop').enabled(context({ selected: [fathom] }))).toBe(false);
  });

  it('refuses a selection of nothing but platform and own applications', () => {
    expect(action('stop').enabled(context({ selected: [systemApp, ownApp] }))).toBe(false);
  });

  it('leaves the platform application and this section out of a mixed selection', () => {
    const ctx = context({ selected: [booster, fathom, systemApp, ownApp] });

    expect(action('stop').enabled(ctx)).toBe(true);
    void action('stop').run(ctx);

    expect(stopApplications).toHaveBeenCalledWith([booster]);
  });
});
