import { describe, expect, it } from 'vitest';

import type { ApplicationInfo } from '../../../entities/application';
import { adminGroups } from './application-admin';

const EMPTY: ApplicationInfo = {
  contentTypes: [],
  mixins: [],
  formFragments: [],
  pages: [],
  parts: [],
  layouts: [],
  macros: [],
  tasks: [],
  adminTools: [],
  adminExtensions: [],
  apis: [],
};

function info(overrides: Partial<ApplicationInfo>): ApplicationInfo {
  return { ...EMPTY, ...overrides };
}

describe('adminGroups', () => {
  it('has nothing to show without an info', () => {
    expect(adminGroups(undefined)).toEqual([]);
  });

  it('drops the groups the application does not contribute to', () => {
    const groups = adminGroups(
      info({
        adminExtensions: [{ key: 'app:w', name: 'w', displayName: 'Extension', interfaces: [] }],
      }),
    );

    expect(groups.map(({ labelKey }) => labelKey)).toEqual(['applications.details.extensions']);
  });

  it('links an admin tool to its url, sorted by title', () => {
    const groups = adminGroups(
      info({
        adminTools: [
          { key: 'app:users', name: 'users', displayName: 'Users', url: '/admin/tool/app/users' },
          { key: 'app:cs', name: 'cs', displayName: 'Content Studio', url: '/admin/tool/app/cs' },
        ],
      }),
    );

    expect(groups[0]?.items).toEqual([
      { key: 'app:cs', label: 'Content Studio', url: '/admin/tool/app/cs' },
      { key: 'app:users', label: 'Users', url: '/admin/tool/app/users' },
    ]);
  });

  it('names an extension after its interfaces and groups the ones sharing an interface', () => {
    const groups = adminGroups(
      info({
        adminExtensions: [
          {
            key: 'app:json',
            name: 'json',
            displayName: 'JSON',
            interfaces: ['contentstudio.liveview'],
          },
          {
            key: 'app:dashboard',
            name: 'dashboard',
            displayName: 'Content Studio',
            interfaces: ['admin.dashboard'],
          },
          {
            key: 'app:auto',
            name: 'auto',
            displayName: 'Automatic',
            interfaces: ['contentstudio.liveview'],
          },
        ],
      }),
    );

    expect(groups[0]?.items.map(({ label }) => label)).toEqual([
      'Content Studio (admin.dashboard)',
      'Automatic (contentstudio.liveview)',
      'JSON (contentstudio.liveview)',
    ]);
  });

  it('leaves an extension that plugs into nothing without a suffix', () => {
    const groups = adminGroups(
      info({
        adminExtensions: [{ key: 'app:w', name: 'w', displayName: 'Extension', interfaces: [] }],
      }),
    );

    expect(groups[0]?.items[0]?.label).toBe('Extension');
  });
});
