import { describe, expect, it } from 'vitest';

import { visibleEntries, type BrowseFilterEntry } from './browse-filter';

function entry(id: string, count: number): BrowseFilterEntry {
  return { id, label: id, count };
}

describe('visibleEntries', () => {
  it('keeps every entry something falls into', () => {
    const entries = [entry('a', 3), entry('b', 1)];

    expect(visibleEntries(entries, new Set())).toEqual(entries);
  });

  it('drops an entry nothing falls into', () => {
    expect(visibleEntries([entry('a', 3), entry('b', 0)], new Set()).map(({ id }) => id)).toEqual([
      'a',
    ]);
  });

  it('keeps a ticked entry a search emptied, so it stays possible to untick', () => {
    const kept = visibleEntries([entry('a', 0), entry('b', 0)], new Set(['a']));

    expect(kept.map(({ id }) => id)).toEqual(['a']);
  });

  it('offers nothing when a search matched nothing and nothing is ticked', () => {
    expect(visibleEntries([entry('a', 0)], new Set())).toEqual([]);
  });
});
