import { describe, expect, it } from 'vitest';

import type { Application } from '../../../entities/application';
import type { MarketApplication } from '../../../entities/market';
import {
  applicationStateLabelKey,
  availableVersions,
  toApplicationRow,
  toUploadRow,
} from './applications.rows';

function application(overrides: Partial<Application> = {}): Application {
  return {
    key: 'com.enonic.app.booster',
    displayName: 'Booster',
    description: 'Caches rendered pages',
    version: '1.2.0',
    state: 'STARTED',
    system: false,
    local: false,
    ...overrides,
  };
}

function marketApplication(
  key: string,
  latestVersion: string,
  updateAvailable: boolean,
): MarketApplication {
  const latest = { version: latestVersion, downloadUrl: `https://repo.enonic.com/${key}.jar` };
  return { key, displayName: key, latest, updateAvailable, installedAhead: false };
}

describe('toApplicationRow', () => {
  it('keys the row by the application key and puts the description under the name', () => {
    const row = toApplicationRow(application());

    expect(row.key).toBe('com.enonic.app.booster');
    expect(row.title).toBe('Booster');
    expect(row.subtitle).toBe('Caches rendered pages');
  });

  it('shows the version cell the page supplied and the state label, state last', () => {
    const row = toApplicationRow(application(), undefined, 'Started', 'Installed: 1.2.0');

    expect(row.meta).toEqual(['Installed: 1.2.0', 'Started']);
  });

  it('leaves out the version cell where the page supplied none', () => {
    const row = toApplicationRow(application(), undefined, 'Stopped');

    expect(row.meta).toEqual(['Stopped']);
  });

  it('drops the state cell on an application XP ships, whose state cannot change', () => {
    const row = toApplicationRow(application({ system: true }), undefined, 'Started', '1.2.0');

    expect(row.meta).toEqual(['1.2.0', '']);
  });

  it('dim a stopped application', () => {
    expect(toApplicationRow(application({ state: 'STOPPED' })).dimmed).toBe(true);
    expect(toApplicationRow(application({ state: 'STARTED' })).dimmed).toBe(false);
  });

  // Selection and `Select all` key off this; navigation and the details column do not.
  it('refuses the tick on an application XP ships', () => {
    expect(toApplicationRow(application({ system: true })).selectable).toBe(false);
  });

  it('leaves an installed application selectable, local or not', () => {
    expect(toApplicationRow(application()).selectable).toBe(true);
    expect(toApplicationRow(application({ local: true })).selectable).toBe(true);
  });

  it('carries no meta at all when there is nothing to put in it', () => {
    const row = toApplicationRow(application());

    expect(row.meta).toBeUndefined();
  });
});

describe('availableVersions', () => {
  it('reports the newer version per application key', () => {
    const market = [marketApplication('com.enonic.app.booster', '1.4.0', true)];

    expect(availableVersions(market).get('com.enonic.app.booster')).toBe('1.4.0');
  });

  it('leaves out an application the instance is already up to date on', () => {
    const market = [marketApplication('com.enonic.app.booster', '1.2.0', false)];

    expect(availableVersions(market).has('com.enonic.app.booster')).toBe(false);
  });

  it('reads nothing from a catalogue that has not loaded', () => {
    expect(availableVersions([]).size).toBe(0);
  });
});

describe('applicationStateLabelKey', () => {
  it('resolves a phrase key per state', () => {
    expect(applicationStateLabelKey('STARTED')).toBe('applications.state.started');
    expect(applicationStateLabelKey('STOPPED')).toBe('applications.state.stopped');
  });
});

describe('toUploadRow', () => {
  it('keys the row by the upload rather than by an application key it has not got yet', () => {
    expect(toUploadRow('upload-1', 'booster-3.0.1.jar', null, null).key).toBe('upload-1');
  });

  it('names the row by the file, which is all there is to call it before core reads the jar', () => {
    expect(toUploadRow('upload-1', 'booster-3.0.1.jar', null, null).title).toBe(
      'booster-3.0.1.jar',
    );
  });

  // Selection, navigation and the keyboard cursor all key off this: an upload is not an item.
  it('is disabled, so nothing in the list can act on it', () => {
    expect(toUploadRow('upload-1', 'booster-3.0.1.jar', null, null).disabled).toBe(true);
  });

  it('carries the progress as its one meta cell', () => {
    const progress = 'bar';

    expect(toUploadRow('upload-1', 'booster-3.0.1.jar', null, progress).meta).toEqual([progress]);
  });

  // The icon column is what keeps the file name aligned with the application names below it:
  // `ItemLabel` drops the column altogether for a row that has no icon.
  it('carries an icon, so the row lines up with the applications under it', () => {
    const icon = 'spinner';

    expect(toUploadRow('upload-1', 'booster-3.0.1.jar', icon, null).icon).toBe(icon);
  });
});
