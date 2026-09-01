import { describe, expect, it } from 'vitest';

import type { ApplicationInfo } from '../../../entities/application';
import { extensionGroups } from './application-extensions';

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

describe('extensionGroups', () => {
  it('has nothing to show without an info', () => {
    expect(extensionGroups(undefined)).toEqual([]);
  });

  it('drops the groups the application does not contribute to', () => {
    const groups = extensionGroups(
      info({
        apis: [{ key: 'app:content', name: 'content', displayName: 'content' }],
      }),
    );

    expect(groups.map(({ labelKey }) => labelKey)).toEqual(['applications.details.apis']);
  });

  it('links an admin tool to its url, sorted by title', () => {
    const groups = extensionGroups(
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

  it('names a widget after its interfaces and groups the ones sharing an interface', () => {
    const groups = extensionGroups(
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

  it('leaves a widget that plugs into nothing without a suffix', () => {
    const groups = extensionGroups(
      info({
        adminExtensions: [{ key: 'app:w', name: 'w', displayName: 'Widget', interfaces: [] }],
      }),
    );

    expect(groups[0]?.items[0]?.label).toBe('Widget');
  });

  it('falls back to the name where an api carries no title', () => {
    const groups = extensionGroups(
      info({
        apis: [
          { key: 'app:styles', name: 'styles', displayName: '' },
          { key: 'app:events', name: 'events', displayName: 'Events' },
        ],
      }),
    );

    expect(groups[0]?.items.map(({ label }) => label)).toEqual(['Events', 'styles']);
  });
});
