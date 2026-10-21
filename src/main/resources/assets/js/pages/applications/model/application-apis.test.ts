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

  it('shows the name beside the title where the two differ', () => {
    const entries = apiEntries({
      ...EMPTY,
      apis: [{ key: 'app:graphql', name: 'graphql', displayName: 'Data plane' }],
    });

    expect(entries).toEqual([{ key: 'app:graphql', label: 'Data plane (graphql)' }]);
  });

  it('shows the name alone where the title is the name, sorted by what shows', () => {
    const entries = apiEntries({
      ...EMPTY,
      apis: [
        { key: 'app:styles', name: 'styles', displayName: 'styles' },
        { key: 'app:events', name: 'events', displayName: 'Events' },
      ],
    });

    expect(entries).toEqual([
      { key: 'app:events', label: 'Events (events)' },
      { key: 'app:styles', label: 'styles' },
    ]);
  });
});
