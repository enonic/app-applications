import type { AppError } from '@enonic/ui-utils';
import { atom, type ReadableAtom } from 'nanostores';
import { err, ok, type Result, type ResultAsync } from 'neverthrow';

/**
 * ! The debounce is what makes arrow-key navigation affordable. The active row moves the route, so
 * ! holding a key down would otherwise queue one request per row through a transport that runs them one
 * ! at a time.
 *
 * ! A key already answered is served from the cache without a request, which is what makes stepping back
 * ! and forth through a list free.
 */
const DEBOUNCE_MS = 250;
const CACHE_LIMIT = 50;

export type DetailStatus = 'idle' | 'loading' | 'ready' | 'error';

export type DetailState<T> = {
  status: DetailStatus;
  /** The key this state answers; absent with nothing selected. */
  key?: string;
  /** The key's item once read, kept while the same key is re-read; never another key's. */
  item?: T;
  error?: string;
};

export type DetailLoaderOptions<T> = {
  /**
   * Reads one item by key. `undefined` is an answer rather than a failure: the key names nothing, so
   * there is nothing to show.
   */
  load: (key: string, signal: AbortSignal) => ResultAsync<T | undefined, AppError>;
};

export type DetailLoader<T> = {
  $detail: ReadableAtom<DetailState<T>>;
  /**
   * The selection moved. `undefined` means nothing is selected.
   *
   * ! Every call re-emits, cache hit or not. A caller that seeds editable state from `$detail` — the
   * ! editor dialogs do, for member and permission lists — would overwrite what the user has since
   * ! changed. Safe today only because those callers `show` once per dialog payload and wire no
   * ! `invalidate`; a loader that gains either needs the guard to be real.
   */
  show: (key: string | undefined) => void;
  /** Leaving the section: nothing loaded here means anything once the list is gone. */
  forget: () => void;
  /**
   * The list was reloaded, so what is cached describes rows that are about to be replaced.
   *
   * ! The panel keeps showing what it has — the selection has not changed — but the next selection is
   * ! read fresh, and the selected item is re-read as well. Without this, `Refresh` never refreshed the
   * ! panel and a cached hit could serve stale detail beside an updated row.
   */
  invalidate: () => void;
  /** One item changed elsewhere: its cached copy goes, and it is re-read in place if it is the selected one. */
  evict: (key: string) => void;
  /**
   * What a panel for `key` renders now. The store lags the selection by an effect and a tick, so another
   * key's state is not it: the cache answers a key already read, anything else is loading.
   */
  detailFor: (key: string | undefined) => DetailState<T>;
};

/**
 * A details panel that loads by key: one request in flight, a debounce in front of it and a small cache
 * behind it.
 *
 * The panel of a section that loads whole could read its item out of the list instead, and three of them
 * used to. It costs less to load by key anyway — the expensive half of a principal is its member lists,
 * which no list may fetch per row — and it buys the panel independence from the list: it can tell a
 * deleted item from one the list has not reached, and it goes on working when the section starts paging.
 *
 * What the request is stays with the domain, in the `load` callback. This file owns only the machinery.
 */
export function createDetailLoader<T extends { key: string }>({
  load,
}: DetailLoaderOptions<T>): DetailLoader<T> {
  const $detail = atom<DetailState<T>>({ status: 'idle' });
  const cache = new Map<string, T>();

  let pending: AbortController | undefined;
  let scheduled: ReturnType<typeof setTimeout> | undefined;

  function cancel(): void {
    if (scheduled !== undefined) {
      clearTimeout(scheduled);
      scheduled = undefined;
    }
    pending?.abort();
  }

  // Oldest out first, so stepping through a long list cannot grow this without bound.
  function remember(key: string, item: T): void {
    if (cache.size >= CACHE_LIMIT) {
      const [oldest] = cache.keys();
      if (oldest !== undefined) {
        cache.delete(oldest);
      }
    }
    cache.set(key, item);
  }

  function receive(key: string, result: Result<T | undefined, AppError>): void {
    result.match(
      (item) =>
        $detail.set(item === undefined ? { status: 'idle', key } : { status: 'ready', key, item }),
      (error) => $detail.set({ status: 'error', key, error: error.message }),
    );
  }

  function request(key: string): Promise<void> {
    const controller = new AbortController();
    pending = controller;
    const { signal } = controller;

    return load(key, signal).match(
      (item) => {
        if (signal.aborted) {
          return;
        }
        if (item !== undefined) {
          remember(key, item);
        }
        receive(key, ok(item));
      },
      (error) => {
        if (!signal.aborted) {
          receive(key, err(error));
        }
      },
    );
  }

  function show(key: string | undefined): void {
    cancel();

    if (key === undefined) {
      $detail.set({ status: 'idle' });
      return;
    }

    const cached = cache.get(key);
    if (cached !== undefined) {
      receive(key, ok(cached));
      return;
    }

    // A new key starts from nothing; the same key keeps its item while re-read.
    const { item } = $detail.get();
    $detail.set({ status: 'loading', key, item: item?.key === key ? item : undefined });
    scheduled = setTimeout(() => void request(key), DEBOUNCE_MS);
  }

  return {
    $detail,
    show,

    forget(): void {
      cancel();
      cache.clear();
      $detail.set({ status: 'idle' });
    },

    invalidate(): void {
      cache.clear();

      const { key } = $detail.get();
      if (key !== undefined) {
        show(key);
      }
    },

    evict(key: string): void {
      cache.delete(key);

      if ($detail.get().key === key) {
        show(key);
      }
    },

    detailFor(key: string | undefined): DetailState<T> {
      if (key === undefined) {
        return { status: 'idle' };
      }

      const state = $detail.get();
      if (state.key === key) {
        return state;
      }

      const cached = cache.get(key);
      return cached === undefined
        ? { status: 'loading', key }
        : { status: 'ready', key, item: cached };
    },
  };
}
