import { atom, type ReadableAtom } from 'nanostores';
import { err, ok, type Result, type ResultAsync } from 'neverthrow';

import type { AppError } from '../api';

/**
 * ! The debounce is what makes arrow-key navigation affordable: the active row moves the url, so holding a
 * ! key down would queue one request per row through a transport that runs them one at a time. A key
 * ! already answered is served from the cache, so stepping back and forth is free.
 */
const DEBOUNCE_MS = 250;
const CACHE_LIMIT = 50;

export type DetailStatus = 'idle' | 'loading' | 'ready' | 'error';

export type DetailState<T> = {
  status: DetailStatus;
  /**
   * What the panel shows, or the last thing it showed while the next is on its way. ! Absent once a load
   * failed: keeping the previous item would describe a row other than the selected one, silently.
   */
  item?: T;
  error?: string;
};

export type DetailLoaderOptions<T> = {
  /** Reads one item by key. `undefined` is an answer, not a failure: the key names nothing. */
  load: (key: string, signal: AbortSignal) => ResultAsync<T | undefined, AppError>;
};

export type DetailLoader<T> = {
  $detail: ReadableAtom<DetailState<T>>;
  /**
   * The selection moved; `undefined` means nothing is selected. ! Every call re-emits, cache hit or not,
   * so a caller seeding editable state from `$detail` would overwrite what the user has since changed —
   * safe only while such callers `show` once per payload and wire no `invalidate`.
   */
  show: (key: string | undefined) => void;
  /** Leaving the section: nothing loaded here means anything once the list is gone. */
  forget: () => void;
  /**
   * The list was reloaded, so the cache describes rows about to be replaced. ! The panel keeps what it has
   * — the selection did not move — but the selected item is re-read; without this, Refresh never refreshed
   * the panel and a cache hit could serve stale detail beside an updated row.
   */
  invalidate: () => void;
};

/**
 * A details panel that loads by key: one request in flight, a debounce in front, a small cache behind.
 * Loading by key rather than reading the list buys independence from it — a deleted item is told from one
 * the list has not reached, and paging changes nothing. The request itself stays in the `load` callback.
 */
export function createDetailLoader<T extends { key: string }>({
  load,
}: DetailLoaderOptions<T>): DetailLoader<T> {
  const $detail = atom<DetailState<T>>({ status: 'idle' });
  const cache = new Map<string, T>();

  let pending: AbortController | undefined;
  let scheduled: ReturnType<typeof setTimeout> | undefined;

  /**
   * ! The selected key, not the key of the item on screen — during a load that is still the previous item,
   * ! and an error leaves none. `invalidate` re-reads what is selected, so it cannot ask the state.
   */
  let selected: string | undefined;

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

  function receive(result: Result<T | undefined, AppError>): void {
    result.match(
      (item) => $detail.set(item === undefined ? { status: 'idle' } : { status: 'ready', item }),
      (error) => $detail.set({ status: 'error', error: error.message }),
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
        receive(ok(item));
      },
      (error) => {
        if (!signal.aborted) {
          receive(err(error));
        }
      },
    );
  }

  function show(key: string | undefined): void {
    cancel();
    selected = key;

    if (key === undefined) {
      $detail.set({ status: 'idle' });
      return;
    }

    const cached = cache.get(key);
    if (cached !== undefined) {
      receive(ok(cached));
      return;
    }

    // ! Keeps what is on screen while the next item is fetched, so stepping through rows does not flash
    // ! empty. The message goes, though: it belonged to the load that failed, not to this one.
    $detail.set({ status: 'loading', item: $detail.get().item });
    scheduled = setTimeout(() => void request(key), DEBOUNCE_MS);
  }

  return {
    $detail,
    show,

    forget(): void {
      cancel();
      cache.clear();
      selected = undefined;
      $detail.set({ status: 'idle' });
    },

    invalidate(): void {
      cache.clear();

      if (selected !== undefined) {
        show(selected);
      }
    },
  };
}
