import { AppError } from '@enonic/ui-utils';
import { errAsync, okAsync, type ResultAsync } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createDetailLoader } from './detail.store';

const DEBOUNCE_MS = 250;

type Thing = { key: string; name: string };

type Answer = ResultAsync<Thing | undefined, AppError>;

function thing(key: string): Thing {
  return { key, name: key };
}

/** A loader over a stubbed `load`, so the machinery alone is under test. */
function loaderOver(load: (key: string, signal: AbortSignal) => Answer) {
  const calls: string[] = [];
  const loader = createDetailLoader<Thing>({
    load: (key, signal) => {
      calls.push(key);
      return load(key, signal);
    },
  });

  return { loader, calls };
}

function answering(): ReturnType<typeof loaderOver> {
  return loaderOver((key) => okAsync(thing(key)));
}

function failingWhen(fail: () => boolean): ReturnType<typeof loaderOver> {
  return loaderOver((key) => (fail() ? errAsync(new AppError('Gone')) : okAsync(thing(key))));
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('createDetailLoader', () => {
  it('starts idle, with nothing selected', () => {
    expect(answering().loader.$detail.get()).toEqual({ status: 'idle' });
  });

  it('reads the key it was shown and reports it ready', async () => {
    const { loader, calls } = answering();

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(calls).toEqual(['a']);
    expect(loader.$detail.get()).toEqual({ status: 'ready', key: 'a', item: thing('a') });
  });

  it('sends nothing before the debounce has elapsed', () => {
    const { loader, calls } = answering();

    loader.show('a');
    vi.advanceTimersByTime(DEBOUNCE_MS - 1);

    expect(calls).toEqual([]);
    expect(loader.$detail.get().status).toBe('loading');
  });

  // ! Holding an arrow key down walks the route through every row; each would otherwise be a request.
  it('asks only for the key the stepping stopped on', async () => {
    const { loader, calls } = answering();

    loader.show('a');
    vi.advanceTimersByTime(100);
    loader.show('b');
    vi.advanceTimersByTime(100);
    loader.show('c');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(calls).toEqual(['c']);
  });

  it('serves a key it has already read without asking again', async () => {
    const { loader, calls } = answering();

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    loader.show('b');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    loader.show('a');

    // Immediately, with no timer to wait for and no third read.
    expect(loader.$detail.get()).toEqual({ status: 'ready', key: 'a', item: thing('a') });
    expect(calls).toEqual(['a', 'b']);
  });

  it('shows nothing while a new key loads', async () => {
    const { loader } = answering();

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    loader.show('b');

    expect(loader.$detail.get()).toEqual({ status: 'loading', key: 'b' });
  });

  it('keeps the item on screen while the same key is re-read', async () => {
    const { loader } = answering();

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    loader.invalidate();

    expect(loader.$detail.get()).toEqual({ status: 'loading', key: 'a', item: thing('a') });
  });

  it('empties the panel when nothing is selected', async () => {
    const { loader } = answering();

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    loader.show(undefined);

    expect(loader.$detail.get()).toEqual({ status: 'idle' });
  });

  // ! Null is an answer, not a failure, and is not cached: a deleted item must not keep answering.
  it('empties the panel for a key nothing answers to, without calling it a failure', async () => {
    const { loader, calls } = loaderOver(() => okAsync(undefined));

    loader.show('gone');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    expect(loader.$detail.get()).toEqual({ status: 'idle', key: 'gone' });

    loader.show('gone');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    expect(calls).toEqual(['gone', 'gone']);
  });

  // ! A stale item beside an error would say nothing about being stale.
  it('drops the item on screen when its re-read fails', async () => {
    let fail = false;
    const { loader } = failingWhen(() => fail);

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    fail = true;
    loader.invalidate();
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(loader.$detail.get()).toEqual({ status: 'error', key: 'a', error: 'Gone' });
  });

  // ! An overtaken answer must not land after a newer one.
  it('drops the answer to a request it cancelled', async () => {
    const signals: AbortSignal[] = [];
    const { loader } = loaderOver((key, signal) => {
      signals.push(signal);
      return okAsync(thing(key));
    });

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    expect(signals[0]?.aborted).toBe(false);

    loader.show('b');
    expect(signals[0]?.aborted).toBe(true);
  });

  it('forgets everything on leaving, cache included', async () => {
    const { loader, calls } = answering();

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    loader.forget();
    expect(loader.$detail.get()).toEqual({ status: 'idle' });

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(calls).toEqual(['a', 'a']);
  });

  // ! What `Refresh` needs: the open item is re-read rather than left stale beside a fresh row.
  it('re-reads the open item on invalidate', async () => {
    const { loader, calls } = answering();

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    loader.invalidate();
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(calls).toEqual(['a', 'a']);
    expect(loader.$detail.get()).toEqual({ status: 'ready', key: 'a', item: thing('a') });
  });

  it('re-reads the selected key on invalidate, not the one last shown', async () => {
    const { loader, calls } = answering();

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    loader.show('b');

    loader.invalidate();
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(calls).toEqual(['a', 'b']);
    expect(loader.$detail.get()).toEqual({ status: 'ready', key: 'b', item: thing('b') });
  });

  // The selection stands after a failure, so `Refresh` is what retries it.
  it('re-reads the selected item on invalidate after a failed load', async () => {
    let fail = true;
    const { loader, calls } = failingWhen(() => fail);

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    expect(loader.$detail.get()).toEqual({ status: 'error', key: 'a', error: 'Gone' });

    fail = false;
    loader.invalidate();
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(calls).toEqual(['a', 'a']);
    expect(loader.$detail.get()).toEqual({ status: 'ready', key: 'a', item: thing('a') });
  });

  it('asks for nothing on invalidate when the panel is empty', async () => {
    const { loader, calls } = answering();

    loader.invalidate();
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(calls).toEqual([]);
    expect(loader.$detail.get()).toEqual({ status: 'idle' });
  });

  it('asks for nothing on invalidate once the section has been left', async () => {
    const { loader, calls } = answering();

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    loader.forget();

    loader.invalidate();
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(calls).toEqual(['a']);
    expect(loader.$detail.get()).toEqual({ status: 'idle' });
  });

  it('re-reads an evicted key only while it is the one shown', async () => {
    const { loader, calls } = answering();

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    loader.evict('b');
    expect(loader.$detail.get()).toEqual({ status: 'ready', key: 'a', item: thing('a') });

    loader.evict('a');
    expect(loader.$detail.get()).toEqual({ status: 'loading', key: 'a', item: thing('a') });
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(calls).toEqual(['a', 'a']);
  });
});

describe('detailFor', () => {
  it('is idle with nothing selected', () => {
    expect(answering().loader.detailFor(undefined)).toEqual({ status: 'idle' });
  });

  it('answers with the store state about the key', async () => {
    const { loader } = answering();

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(loader.detailFor('a')).toBe(loader.$detail.get());
  });

  // The store lags the selection by an effect and a tick; a key already read must not paint the skeleton.
  it('answers a cached key as ready before it is shown again', async () => {
    const { loader, calls } = answering();

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    loader.show('b');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(loader.detailFor('a')).toEqual({ status: 'ready', key: 'a', item: thing('a') });
    expect(calls).toEqual(['a', 'b']);
  });

  it('reads a key it has not seen as loading', () => {
    expect(answering().loader.detailFor('c')).toEqual({ status: 'loading', key: 'c' });
  });
});
