import { describe, expect, it } from 'vitest';

import type { Application } from '../../../entities/application';
import {
  filterApplicationsBySystem,
  searchApplications,
  SYSTEM_ENTRY,
  systemEntry,
} from './applications.filter';

function application(
  key: string,
  displayName: string,
  description?: string,
  system = false,
): Application {
  return {
    key,
    displayName,
    description,
    version: '1.0.0',
    state: 'STARTED',
    system,
    local: false,
  };
}

const booster = application('com.enonic.app.booster', 'Booster', 'Caches rendered pages');
const fathom = application('com.enonic.app.fathom', 'Fathom');
const systemApp = application('com.enonic.xp.app.system', 'System', undefined, true);
const applications = [booster, fathom];

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

  it('survives an application without a description', () => {
    expect(searchApplications(applications, 'fathom')).toEqual([fathom]);
  });

  it('leaves the applications it was given alone', () => {
    const original = [...applications];
    searchApplications(applications, 'booster');

    expect(applications).toEqual(original);
  });
});

describe('filterApplicationsBySystem', () => {
  const all = [booster, systemApp, fathom];

  it('drops the system applications while the entry is unticked', () => {
    expect(filterApplicationsBySystem(all, new Set())).toEqual([booster, fathom]);
  });

  it('keeps them once it is ticked, in the order it was given them', () => {
    expect(filterApplicationsBySystem(all, new Set([SYSTEM_ENTRY]))).toEqual(all);
  });

  it('ignores an id it does not know', () => {
    expect(filterApplicationsBySystem(all, new Set(['local']))).toEqual([booster, fathom]);
  });

  it('leaves the applications it was given alone', () => {
    const original = [...all];
    filterApplicationsBySystem(all, new Set());

    expect(all).toEqual(original);
  });
});

describe('systemEntry', () => {
  it('counts the system applications among the rows it was given', () => {
    expect(systemEntry([booster, systemApp, fathom], 'System applications')).toEqual({
      id: SYSTEM_ENTRY,
      label: 'System applications',
      count: 1,
    });
  });

  it('reads zero rather than being left out, so the entry is always offered', () => {
    expect(systemEntry(applications, 'System applications').count).toBe(0);
  });
});
