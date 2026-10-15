import { useState } from 'preact/hooks';

import { DETAILS_LIST_PAGE_SIZE, sliceLoadMore, type LoadMoreSlice } from './load-more';

export type LoadMoreOptions = {
  /** The size of the whole set when `items` is only the page of it that was loaded. */
  total?: number;
  /** The caller pages: every row in `items` is visible, and `loadMore` asks for the next page. */
  onLoadMore?: () => void;
};

export type LoadMore<T> = LoadMoreSlice<T> & {
  loadMore: () => void;
};

/** The rows a capped list renders, and a `loadMore` that reveals a page more of them. */
export function useLoadMore<T>(
  items: readonly T[],
  { total, onLoadMore }: LoadMoreOptions,
): LoadMore<T> {
  const [visibleLimit, setVisibleLimit] = useState(DETAILS_LIST_PAGE_SIZE);

  const slice = sliceLoadMore(items, {
    limit: visibleLimit,
    total,
    paged: onLoadMore !== undefined,
  });

  const loadMore =
    onLoadMore ?? ((): void => setVisibleLimit((count) => count + DETAILS_LIST_PAGE_SIZE));

  return { ...slice, loadMore };
}
