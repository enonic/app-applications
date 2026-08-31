import { describe, expect, it } from 'vitest';

import { createSearchStore } from './search.store';

describe('createSearchStore', () => {
  it('starts empty', () => {
    expect(createSearchStore().$query.get()).toBe('');
  });

  it('replaces the query on set', () => {
    const search = createSearchStore();

    search.set('store');

    expect(search.$query.get()).toBe('store');
  });

  it('empties the query on clear', () => {
    const search = createSearchStore();
    search.set('store');

    search.clear();

    expect(search.$query.get()).toBe('');
  });

  it('notifies subscribers on a real change only', () => {
    const search = createSearchStore();
    const seen: string[] = [];
    const unbind = search.$query.subscribe((query) => seen.push(query));

    search.set('store');
    search.clear();
    search.clear();

    unbind();
    expect(seen).toEqual(['', 'store', '']);
  });
});
