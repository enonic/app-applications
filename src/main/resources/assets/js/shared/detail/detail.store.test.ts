import { errAsync, okAsync, type ResultAsync } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../api';
import { createDetailLoader } from './detail.store';

const DEBOUNCE_MS = 250;

type Thing = { key: string; name: string };

type Answer = ResultAsync<Thing | undefined, AppError>;

function thing(key: string): Thing {
  return { key, name: key };
}

/**
 * A loader over a `load` that answers whatever the test tells it to, so the machinery is what is under
 * test: the domain's own read is stubbed out entirely.
 */
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
    expect(loader.$detail.get()).toEqual({ status: 'ready', item: thing('a') });
  });

  it('sends nothing before the debounce has elapsed', () => {
    const { loader, calls } = answering();

    loader.show('a');
    vi.advanceTimersByTime(DEBOUNCE_MS - 1);

    expect(calls).toEqual([]);
    expect(loader.$detail.get().status).toBe('loading');
  });

  // ! What the debounce exists for: holding an arrow key down walks the route through every row, and each
  // ! would otherwise be a request through a transport that sends one at a time.
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
    expect(loader.$detail.get()).toEqual({ status: 'ready', item: thing('a') });
    expect(calls).toEqual(['a', 'b']);
  });

  it('keeps what it has on screen while the next item loads, so stepping does not flash empty', async () => {
    const { loader } = answering();

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    loader.show('b');

    expect(loader.$detail.get()).toEqual({ status: 'loading', item: thing('a') });
  });

  it('empties the panel when nothing is selected', async () => {
    const { loader } = answering();

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    loader.show(undefined);

    expect(loader.$detail.get()).toEqual({ status: 'idle' });
  });

  // ! Null is an answer, not a failure: the key names nothing, so there is nothing to show. It must not
  // ! be remembered either, or a deleted item would keep answering from the cache.
  it('empties the panel for a key nothing answers to, without calling it a failure', async () => {
    const { loader, calls } = loaderOver(() => okAsync(undefined));

    loader.show('gone');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    expect(loader.$detail.get()).toEqual({ status: 'idle' });

    loader.show('gone');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    expect(calls).toEqual(['gone', 'gone']);
  });

  // ! A failure drops the item rather than keeping the previous one: the panel would otherwise describe
  // ! something other than the selected row with nothing on screen to say so.
  it('drops what it was showing when a load fails', async () => {
    let fail = false;
    const { loader } = loaderOver((key) =>
      fail ? errAsync(new AppError('Gone')) : okAsync(thing(key)),
    );

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    fail = true;
    loader.show('b');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(loader.$detail.get()).toEqual({ status: 'error', error: 'Gone' });
  });

  // ! The answer to an overtaken key must not land after a newer one, or the panel shows an item the list
  // ! is no longer pointing at.
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

  // ! What `Refresh` needs: the cached item describes a row that is about to be replaced, so the open one
  // ! is re-read rather than left stale beside a fresh row.
  it('re-reads the open item on invalidate', async () => {
    const { loader, calls } = answering();

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    loader.invalidate();
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(calls).toEqual(['a', 'a']);
    expect(loader.$detail.get()).toEqual({ status: 'ready', item: thing('a') });
  });

  // ! Invalidating mid-load must re-read what is selected, not what is on screen: the item shown during a
  // ! load is still the previous one, so asking the state would load the row the user has just left and
  // ! leave the panel describing it while the route points at another.
  it('re-reads the selected item on invalidate, not the one still on screen', async () => {
    const { loader, calls } = answering();

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    loader.show('b');

    loader.invalidate();
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(calls).toEqual(['a', 'b']);
    expect(loader.$detail.get()).toEqual({ status: 'ready', item: thing('b') });
  });

  // The selection stands after a failure, so `Refresh` is what retries it.
  it('re-reads the selected item on invalidate after a failed load', async () => {
    let fail = true;
    const { loader, calls } = loaderOver((key) =>
      fail ? errAsync(new AppError('Gone')) : okAsync(thing(key)),
    );

    loader.show('a');
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);
    expect(loader.$detail.get()).toEqual({ status: 'error', error: 'Gone' });

    fail = false;
    loader.invalidate();
    await vi.advanceTimersByTimeAsync(DEBOUNCE_MS);

    expect(calls).toEqual(['a', 'a']);
    expect(loader.$detail.get()).toEqual({ status: 'ready', item: thing('a') });
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
});
