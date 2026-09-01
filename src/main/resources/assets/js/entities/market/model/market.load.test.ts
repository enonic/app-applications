import { errAsync, ResultAsync } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../../../shared/api';
import { fetchMarketApplications } from '../api/market.api';
import { ensureMarketApplications, loadMarketApplications, marketLoadSettled } from './market.load';
import { $marketApplications } from './market.store';
import type { MarketApplication } from './market.types';

vi.mock('../api/market.api', () => ({ fetchMarketApplications: vi.fn() }));

function marketApplication(key: string): MarketApplication {
  return {
    key,
    displayName: key,
    latest: { version: '8.0.0', downloadUrl: `https://repo.enonic.com/${key}-8.0.0.jar` },
    updateAvailable: false,
    installedAhead: false,
  };
}

const guillotine = marketApplication('com.enonic.app.guillotine');

function answersWith(applications: MarketApplication[]): void {
  vi.mocked(fetchMarketApplications).mockReturnValueOnce(
    ResultAsync.fromSafePromise(Promise.resolve(applications)),
  );
}

/** Queues an answer the test hands over itself, so it can order two loads against each other. */
function answersLater(): (applications: MarketApplication[]) => void {
  let deliver: (applications: MarketApplication[]) => void = () => {};

  vi.mocked(fetchMarketApplications).mockReturnValueOnce(
    ResultAsync.fromSafePromise(
      new Promise<MarketApplication[]>((resolve) => {
        deliver = resolve;
      }),
    ),
  );

  return (applications) => deliver(applications);
}

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

beforeEach(() => {
  vi.mocked(fetchMarketApplications).mockReset();
  vi.mocked(fetchMarketApplications).mockReturnValue(
    ResultAsync.fromSafePromise(Promise.resolve<MarketApplication[]>([])),
  );
  $marketApplications.set({ status: 'loading', items: [] });
});

describe('ensureMarketApplications', () => {
  it('reads the market the first time something asks for it', async () => {
    answersWith([guillotine]);

    await ensureMarketApplications();

    expect($marketApplications.get().items).toEqual([guillotine]);
    expect(fetchMarketApplications).toHaveBeenCalledTimes(1);
  });

  it('serves the cached catalogue rather than leaving the instance again', async () => {
    answersWith([guillotine]);
    await ensureMarketApplications();

    await ensureMarketApplications();

    expect(fetchMarketApplications).toHaveBeenCalledTimes(1);
  });

  it('joins a load already in flight instead of starting a second one', async () => {
    answersWith([guillotine]);

    await Promise.all([ensureMarketApplications(), ensureMarketApplications()]);

    expect(fetchMarketApplications).toHaveBeenCalledTimes(1);
  });

  it('tries again after a failed load, since nothing was cached', async () => {
    vi.mocked(fetchMarketApplications).mockReturnValueOnce(errAsync(new AppError('offline')));
    await ensureMarketApplications();

    await ensureMarketApplications();

    expect(fetchMarketApplications).toHaveBeenCalledTimes(2);
  });
});

describe('loadMarketApplications', () => {
  it('reads the market again even with a catalogue already loaded', async () => {
    answersWith([guillotine]);
    await ensureMarketApplications();

    answersWith([]);
    await loadMarketApplications();

    expect(fetchMarketApplications).toHaveBeenCalledTimes(2);
    expect($marketApplications.get().items).toEqual([]);
  });

  it('reports a failure as state rather than as a notification', async () => {
    vi.mocked(fetchMarketApplications).mockReturnValueOnce(errAsync(new AppError('offline')));

    await loadMarketApplications();

    expect($marketApplications.get()).toEqual({ status: 'error', items: [], error: 'offline' });
  });

  it('cancels the load it replaced and keeps the newer answer', async () => {
    answersWith([marketApplication('stale')]);
    const first = loadMarketApplications();
    answersWith([guillotine]);
    const second = loadMarketApplications();

    await Promise.all([first, second]);

    expect($marketApplications.get().items).toEqual([guillotine]);
  });

  it('passes a signal, so the transport can drop a request nobody waits for', () => {
    void loadMarketApplications();

    const [signal] = vi.mocked(fetchMarketApplications).mock.calls[0] ?? [];
    expect(signal).toBeInstanceOf(AbortSignal);
  });
});

describe('marketLoadSettled', () => {
  it('waits for the load in flight rather than starting one', async () => {
    answersWith([guillotine]);
    void loadMarketApplications();

    await marketLoadSettled();

    expect($marketApplications.get().items).toEqual([guillotine]);
    expect(fetchMarketApplications).toHaveBeenCalledTimes(1);
  });

  it('resolves at once with nothing in flight', async () => {
    await marketLoadSettled();

    expect(fetchMarketApplications).not.toHaveBeenCalled();
  });

  // ! The reason it loops: an install waiting here would otherwise be released by its own load being
  // ! aborted, against the catalogue that load never delivered.
  it('follows the load that superseded the one it was waiting on', async () => {
    const first = answersLater();
    void loadMarketApplications();

    let released = false;
    const settled = marketLoadSettled().then(() => (released = true));

    const second = answersLater();
    void loadMarketApplications();

    first([marketApplication('stale')]);
    await flush();
    expect(released).toBe(false);

    second([guillotine]);
    await settled;

    expect($marketApplications.get().items).toEqual([guillotine]);
  });
});
