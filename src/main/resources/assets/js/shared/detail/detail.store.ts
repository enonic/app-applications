import { atom, type ReadableAtom } from 'nanostores';
import { err, ok, type Result, type ResultAsync } from 'neverthrow';

import type { AppError } from '../api';

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
  /**
   * What the panel is showing, or the last thing it showed while the next is on its way.
   *
   * ! Absent once a load has failed, deliberately: keeping the previous item would leave the panel
   * ! describing something other than the selected row, with nothing on screen to say it is stale.
   */
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

  /**
   * ! The selected key, which is not the key of the item on screen: during a load that one is still the
   * ! previous item, and while an error shows there is no item at all. `invalidate` has to re-read what is
   * ! selected, so it cannot ask the state.
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

    evict(key: string): void {
      cache.delete(key);

      if (selected === key) {
        show(key);
      }
    },
  };
}
