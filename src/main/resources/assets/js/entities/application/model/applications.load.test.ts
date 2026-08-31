import { errAsync, ResultAsync } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../../../shared/api';
import { fetchApplication, fetchApplications } from '../api/applications.api';
import type { Application } from './application.types';
import { ensureApplications, loadApplication, loadApplications } from './applications.load';
import { $applications } from './applications.store';

vi.mock('../api/applications.api', () => ({
  fetchApplications: vi.fn(),
  fetchApplication: vi.fn(),
}));

function application(key: string): Application {
  return { key, displayName: key, version: '1.0.0', state: 'STARTED', system: false, local: false };
}

const booster = application('com.enonic.app.booster');

function answersWith(applications: Application[]): void {
  vi.mocked(fetchApplications).mockReturnValueOnce(
    ResultAsync.fromSafePromise(Promise.resolve(applications)),
  );
}

function answersOneWith(application: Application | undefined): void {
  vi.mocked(fetchApplication).mockReturnValueOnce(
    ResultAsync.fromSafePromise(Promise.resolve(application)),
  );
}

beforeEach(() => {
  // A default answer, so a load nobody planned for cannot throw instead of failing an expectation.
  vi.mocked(fetchApplications).mockReset();
  vi.mocked(fetchApplications).mockReturnValue(
    ResultAsync.fromSafePromise(Promise.resolve<Application[]>([])),
  );
  vi.mocked(fetchApplication).mockReset();
  vi.mocked(fetchApplication).mockReturnValue(
    ResultAsync.fromSafePromise(Promise.resolve<Application | undefined>(undefined)),
  );
  $applications.set({ status: 'loading', items: [] });
});

describe('ensureApplications', () => {
  it('loads the list the first time a section asks for it', async () => {
    answersWith([booster]);

    await ensureApplications();

    expect($applications.get().items).toEqual([booster]);
    expect(fetchApplications).toHaveBeenCalledTimes(1);
  });

  it('serves a cached list without asking the server again', async () => {
    answersWith([booster]);
    await ensureApplications();

    await ensureApplications();

    expect(fetchApplications).toHaveBeenCalledTimes(1);
    expect($applications.get().items).toEqual([booster]);
  });

  it('loads again after a failed load', async () => {
    vi.mocked(fetchApplications).mockReturnValueOnce(errAsync(new AppError('Endpoint is down')));
    await ensureApplications();
    expect($applications.get().error).toBe('Endpoint is down');

    answersWith([booster]);
    await ensureApplications();

    expect(fetchApplications).toHaveBeenCalledTimes(2);
    expect($applications.get().items).toEqual([booster]);
  });

  it('joins the load in flight rather than starting a second one', async () => {
    let answerSlowly: ((applications: Application[]) => void) | undefined;
    vi.mocked(fetchApplications).mockReturnValueOnce(
      ResultAsync.fromSafePromise(
        new Promise<Application[]>((resolve) => {
          answerSlowly = resolve;
        }),
      ),
    );

    const first = ensureApplications();
    const second = ensureApplications();
    answerSlowly?.([booster]);
    await Promise.all([first, second]);

    expect(fetchApplications).toHaveBeenCalledTimes(1);
    expect($applications.get().items).toEqual([booster]);
  });
});

describe('loadApplications', () => {
  it('reloads a list it already holds — the Refresh button, and a server event', async () => {
    $applications.set({ status: 'ready', items: [booster] });
    const fathom = application('com.enonic.app.fathom');
    answersWith([fathom]);

    await loadApplications();

    expect($applications.get().items).toEqual([fathom]);
  });

  it('keeps the error message the request failed with', async () => {
    vi.mocked(fetchApplications).mockReturnValueOnce(errAsync(new AppError('Endpoint is down')));

    await loadApplications();

    const { status, items, error } = $applications.get();
    expect(status).toBe('error');
    expect(items).toEqual([]);
    expect(error).toBe('Endpoint is down');
  });

  it('drops the answer of the load a newer one replaced', async () => {
    const stale = application('stale');
    const fresh = application('fresh');
    let answerSlowly: ((applications: Application[]) => void) | undefined;

    vi.mocked(fetchApplications)
      .mockReturnValueOnce(
        ResultAsync.fromSafePromise(
          new Promise<Application[]>((resolve) => {
            answerSlowly = resolve;
          }),
        ),
      )
      .mockReturnValueOnce(ResultAsync.fromSafePromise(Promise.resolve([fresh])));

    const slowLoad = loadApplications();
    const fastLoad = loadApplications();
    await fastLoad;
    answerSlowly?.([stale]);
    await slowLoad;

    expect($applications.get().items).toEqual([fresh]);
  });
});

describe('loadApplication', () => {
  beforeEach(() => {
    $applications.set({ status: 'ready', items: [booster] });
  });

  it('replaces the one row it refetched', async () => {
    answersOneWith({ ...booster, state: 'STOPPED' });

    await loadApplication(booster.key);

    expect($applications.get().items).toEqual([{ ...booster, state: 'STOPPED' }]);
    expect(fetchApplications).not.toHaveBeenCalled();
  });

  it('drops a row the server no longer has', async () => {
    answersOneWith(undefined);

    await loadApplication(booster.key);

    expect($applications.get().items).toEqual([]);
  });

  it('inserts a row it did not have where the server ordering puts it', async () => {
    const zebra = { ...application('org.example.zebra'), displayName: 'Zebra' };
    const alpha = { ...application('org.example.alpha'), displayName: 'alpha' };
    $applications.set({ status: 'ready', items: [alpha, zebra] });
    answersOneWith({ ...application('org.example.middle'), displayName: 'Middle' });

    await loadApplication('org.example.middle');

    expect($applications.get().items.map(({ displayName }) => displayName)).toEqual([
      'alpha',
      'Middle',
      'Zebra',
    ]);
  });

  it('keeps the stale row when the refetch fails', async () => {
    vi.mocked(fetchApplication).mockReturnValueOnce(errAsync(new AppError('Endpoint is down')));

    await loadApplication(booster.key);

    const { status, items } = $applications.get();
    expect(status).toBe('ready');
    expect(items).toEqual([booster]);
  });

  it('does nothing before the list is cached', async () => {
    $applications.set({ status: 'loading', items: [] });

    await loadApplication(booster.key);

    expect(fetchApplication).not.toHaveBeenCalled();
  });
});
