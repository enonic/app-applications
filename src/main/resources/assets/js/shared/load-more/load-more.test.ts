import { describe, expect, it } from 'vitest';

import { DETAILS_LIST_PAGE_SIZE, sliceLoadMore } from './load-more';

const keys = (count: number): string[] => Array.from({ length: count }, (_, i) => `key-${i}`);

describe('sliceLoadMore', () => {
  it('shows every row and hides none while the list fits', () => {
    const items = keys(4);

    expect(sliceLoadMore(items, { limit: 10 })).toEqual({
      visible: items,
      hiddenCount: 0,
      nextCount: 0,
    });
  });

  it('cuts the list at the limit and counts the rest', () => {
    const items = keys(19);

    expect(sliceLoadMore(items, { limit: 10 })).toEqual({
      visible: items.slice(0, 10),
      hiddenCount: 9,
      nextCount: 9,
    });
  });

  it('adds a whole page while more than a page is hidden', () => {
    expect(sliceLoadMore(keys(25), { limit: 10 }).nextCount).toBe(DETAILS_LIST_PAGE_SIZE);
  });

  it('counts the whole set, not the rows loaded, when a total is given', () => {
    expect(sliceLoadMore(keys(10), { limit: 10, total: 4213, paged: true })).toEqual({
      visible: keys(10),
      hiddenCount: 4203,
      nextCount: DETAILS_LIST_PAGE_SIZE,
    });
  });

  it('never trusts a total smaller than what is loaded', () => {
    expect(sliceLoadMore(keys(12), { limit: 10, total: 3 }).hiddenCount).toBe(2);
  });

  it('shows every loaded row of a paged set and offers the next page', () => {
    const items = keys(20);

    expect(sliceLoadMore(items, { limit: 10, total: 25, paged: true })).toEqual({
      visible: items,
      hiddenCount: 5,
      nextCount: 5,
    });
  });
});
