import { describe, expect, it } from 'vitest';

import type { ApplicationInfo } from '../../../entities/application';
import { apiEntries } from './application-apis';

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

describe('apiEntries', () => {
  it('has nothing to show without an info', () => {
    expect(apiEntries(undefined)).toEqual([]);
  });

  it('falls back to the name where an api carries no title, sorted by what shows', () => {
    const entries = apiEntries({
      ...EMPTY,
      apis: [
        { key: 'app:styles', name: 'styles', displayName: '' },
        { key: 'app:events', name: 'events', displayName: 'Events' },
      ],
    });

    expect(entries).toEqual([
      { key: 'app:events', label: 'Events' },
      { key: 'app:styles', label: 'styles' },
    ]);
  });
});
