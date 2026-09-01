import { describe, expect, it } from 'vitest';

import { sortByDisplayName } from './browse-sort';

function item(key: string, displayName: string) {
  return { key, displayName };
}

const items = [item('c', 'Expert'), item('a', 'Administrator'), item('b', 'browser')];

describe('sortByDisplayName', () => {
  it('orders by display name, ignoring case', () => {
    expect(sortByDisplayName(items, 'asc').map(({ key }) => key)).toEqual(['a', 'b', 'c']);
  });

  it('reverses on desc', () => {
    expect(sortByDisplayName(items, 'desc').map(({ key }) => key)).toEqual(['c', 'b', 'a']);
  });

  it('breaks a tie on the key, so two items named alike keep a stable order', () => {
    const tied = [item('b.editor', 'Editor'), item('a.editor', 'Editor')];

    expect(sortByDisplayName(tied, 'asc').map(({ key }) => key)).toEqual(['a.editor', 'b.editor']);
  });

  it('leaves the items it was given alone', () => {
    const original = [...items];
    sortByDisplayName(items, 'desc');

    expect(items).toEqual(original);
  });

  it('answers an empty list unchanged', () => {
    expect(sortByDisplayName([], 'asc')).toEqual([]);
  });
});
