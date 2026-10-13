import { EMPTY_FILTER, fieldTerm, type FilterQuery } from '@enonic/ui-kit';
import { describe, expect, it } from 'vitest';

import type { Application, ApplicationState } from '../../../entities/application';
import {
  applicationFields,
  filterApplications,
  NO,
  searchApplications,
  STATE_FIELD,
  SYSTEM_FIELD,
  UPGRADE_FIELD,
  YES,
} from './applications.filter';

function application(
  key: string,
  displayName: string,
  description?: string,
  system = false,
  state: ApplicationState = 'STARTED',
): Application {
  return {
    key,
    displayName,
    description,
    version: '1.0.0',
    state,
    system,
    local: false,
  };
}

const booster = application('com.enonic.app.booster', 'Booster', 'Caches rendered pages');
const fathom = application('com.enonic.app.fathom', 'Fathom', undefined, false, 'STOPPED');
const systemApp = application('com.enonic.xp.app.system', 'System', undefined, true);
const applications = [booster, fathom];
const all = [booster, systemApp, fathom];

const LABELS = {
  system: 'System applications',
  state: 'State',
  started: 'Started',
  stopped: 'Stopped',
  upgrade: 'Upgrade available',
  yes: 'Yes',
  no: 'No',
  marketFailed: 'Market failed',
};

function counts(query: FilterQuery, upgradable: ReadonlySet<string> = new Set()) {
  return Object.fromEntries(
    applicationFields(all, query, upgradable, { status: 'ready' }, LABELS).map(({ id, values }) => [
      id,
      Object.fromEntries(values.map((value) => [value.id, value.count])),
    ]),
  );
}

describe('searchApplications', () => {
  it('returns every application for an empty or blank query', () => {
    expect(searchApplications(applications, '')).toEqual(applications);
    expect(searchApplications(applications, '   ')).toEqual(applications);
  });

  it('matches the display name whatever the case', () => {
    expect(searchApplications(applications, 'BOOSTER')).toEqual([booster]);
  });

  it('matches the description', () => {
    expect(searchApplications(applications, 'rendered')).toEqual([booster]);
  });

  it('matches the application key', () => {
    expect(searchApplications(applications, 'app.fathom')).toEqual([fathom]);
  });

  it('matches every word, each in any of the fields', () => {
    expect(searchApplications(applications, 'pages booster')).toEqual([booster]);
    expect(searchApplications(applications, 'booster fathom')).toEqual([]);
  });

  it('matches a word from its start only', () => {
    expect(searchApplications(applications, 'oster')).toEqual([]);
  });

  it('survives an application without a description', () => {
    expect(searchApplications(applications, 'fathom')).toEqual([fathom]);
  });

  it('leaves the applications it was given alone', () => {
    const original = [...applications];
    searchApplications(applications, 'booster');

    expect(applications).toEqual(original);
  });
});

describe('filterApplications', () => {
  it('hides the system applications with no term, and with No', () => {
    expect(filterApplications(all, EMPTY_FILTER, new Set())).toEqual([booster, fathom]);
    expect(filterApplications(all, [fieldTerm(SYSTEM_FIELD, NO)], new Set())).toEqual([
      booster,
      fathom,
    ]);
  });

  it('reveals them beside the rest with Yes, in the order it was given them', () => {
    expect(filterApplications(all, [fieldTerm(SYSTEM_FIELD, YES)], new Set())).toEqual(all);
  });

  it('narrows by state, the states ORed', () => {
    expect(filterApplications(all, [fieldTerm(STATE_FIELD, 'STOPPED')], new Set())).toEqual([
      fathom,
    ]);
    expect(
      filterApplications(
        all,
        [fieldTerm(STATE_FIELD, 'STOPPED'), fieldTerm(STATE_FIELD, 'STARTED')],
        new Set(),
      ),
    ).toEqual([booster, fathom]);
  });

  it('narrows by whether the market has a newer version', () => {
    const upgradable = new Set([booster.key]);

    expect(filterApplications(all, [fieldTerm(UPGRADE_FIELD, YES)], upgradable)).toEqual([booster]);
    expect(filterApplications(all, [fieldTerm(UPGRADE_FIELD, NO)], upgradable)).toEqual([fathom]);
  });

  it('ANDs the fields', () => {
    const query = [fieldTerm(SYSTEM_FIELD, YES), fieldTerm(STATE_FIELD, 'STARTED')];

    expect(filterApplications(all, query, new Set())).toEqual([booster, systemApp]);
  });

  it('leaves out the field it is told to', () => {
    const query = [fieldTerm(STATE_FIELD, 'STOPPED')];

    expect(filterApplications(all, query, new Set(), STATE_FIELD)).toEqual([booster, fathom]);
    expect(filterApplications(all, EMPTY_FILTER, new Set(), SYSTEM_FIELD)).toEqual(all);
  });
});

describe('applicationFields', () => {
  it('offers System as a single pick, and State and Upgrade as several', () => {
    const fields = applicationFields(all, EMPTY_FILTER, new Set(), { status: 'ready' }, LABELS);

    expect(fields.map(({ id, multiple }) => [id, multiple])).toEqual([
      [SYSTEM_FIELD, false],
      [STATE_FIELD, undefined],
      [UPGRADE_FIELD, undefined],
    ]);
  });

  it('counts System over every application, State and Upgrade over the visible ones', () => {
    expect(counts(EMPTY_FILTER, new Set([booster.key]))).toEqual({
      [SYSTEM_FIELD]: { [YES]: 1, [NO]: 2 },
      [STATE_FIELD]: { STARTED: 1, STOPPED: 1 },
      [UPGRADE_FIELD]: { [YES]: 1, [NO]: 1 },
    });
  });

  it('counts each field over what the other fields leave, never over its own terms', () => {
    const query = [fieldTerm(SYSTEM_FIELD, YES), fieldTerm(STATE_FIELD, 'STOPPED')];

    expect(counts(query)).toEqual({
      [SYSTEM_FIELD]: { [YES]: 0, [NO]: 1 },
      [STATE_FIELD]: { STARTED: 2, STOPPED: 1 },
      [UPGRADE_FIELD]: { [YES]: 0, [NO]: 1 },
    });
  });

  it('leaves Upgrade out without a market, as in managed mode', () => {
    const fields = applicationFields(all, EMPTY_FILTER, new Set(), undefined, LABELS);

    expect(fields.map(({ id }) => id)).toEqual([SYSTEM_FIELD, STATE_FIELD]);
  });

  it('says why Upgrade may be short while the market loads or fails', () => {
    const upgradeOf = (status: 'loading' | 'error') =>
      applicationFields(all, EMPTY_FILTER, new Set(), { status }, LABELS).find(
        ({ id }) => id === UPGRADE_FIELD,
      );

    expect(upgradeOf('loading')).toMatchObject({ loading: true, notice: undefined });
    expect(upgradeOf('error')).toMatchObject({ loading: false, notice: 'Market failed' });
  });
});
