import { errAsync, ResultAsync } from 'neverthrow';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../../../shared/api';
import { fetchApplicationInfo } from '../api/application-info.api';
import {
  $applicationsInfo,
  ensureApplicationInfo,
  invalidateApplicationInfo,
} from './application-info.store';
import type { ApplicationInfo } from './application.types';

vi.mock('../api/application-info.api', () => ({ fetchApplicationInfo: vi.fn() }));

const BOOSTER = 'com.enonic.app.booster';
const FATHOM = 'com.enonic.app.fathom';

function info(deploymentUrl?: string): ApplicationInfo {
  return {
    contentTypes: [],
    mixins: [],
    formFragments: [],
    pages: [],
    parts: [],
    layouts: [],
    macros: [],
    tasks: [],
    adminTools: [],
    adminExtensions: [],
    apis: [],
    deploymentUrl,
  };
}

function answersWith(byKey: (key: string) => ApplicationInfo | undefined): void {
  vi.mocked(fetchApplicationInfo).mockImplementation((key) =>
    ResultAsync.fromSafePromise(Promise.resolve(byKey(key))),
  );
}

async function settled(key: string, status: string): Promise<void> {
  await vi.waitFor(() => expect($applicationsInfo.get()[key]?.status).toBe(status));
}

beforeEach(() => {
  $applicationsInfo.set({});
  vi.mocked(fetchApplicationInfo).mockReset();
  answersWith(() => info());
});

describe('ensureApplicationInfo', () => {
  it('loads an application it has no entry for', async () => {
    answersWith(() => info('/webapp/booster'));

    ensureApplicationInfo(BOOSTER);
    expect($applicationsInfo.get()[BOOSTER]?.status).toBe('loading');
    await settled(BOOSTER, 'ready');

    expect($applicationsInfo.get()[BOOSTER]?.info?.deploymentUrl).toBe('/webapp/booster');
    expect(fetchApplicationInfo).toHaveBeenCalledTimes(1);
  });

  it('serves an entry it already holds', async () => {
    ensureApplicationInfo(BOOSTER);
    await settled(BOOSTER, 'ready');

    ensureApplicationInfo(BOOSTER);

    expect(fetchApplicationInfo).toHaveBeenCalledTimes(1);
  });

  it('sends one request for two calls that race', async () => {
    let answerSlowly: ((info: ApplicationInfo) => void) | undefined;
    vi.mocked(fetchApplicationInfo).mockReturnValueOnce(
      ResultAsync.fromSafePromise(
        new Promise<ApplicationInfo>((resolve) => {
          answerSlowly = resolve;
        }),
      ),
    );

    ensureApplicationInfo(BOOSTER);
    ensureApplicationInfo(BOOSTER);
    answerSlowly?.(info());
    await settled(BOOSTER, 'ready');

    expect(fetchApplicationInfo).toHaveBeenCalledTimes(1);
  });

  it('reports a ready entry with no info where no application answers to the key', async () => {
    answersWith(() => undefined);

    ensureApplicationInfo('com.example.absent');
    await settled('com.example.absent', 'ready');

    expect($applicationsInfo.get()['com.example.absent']?.info).toBeUndefined();
  });

  it('keeps the error message and retries the next time it is asked', async () => {
    vi.mocked(fetchApplicationInfo).mockReturnValueOnce(errAsync(new AppError('Endpoint is down')));

    ensureApplicationInfo(BOOSTER);
    await settled(BOOSTER, 'error');
    expect($applicationsInfo.get()[BOOSTER]?.error).toBe('Endpoint is down');

    ensureApplicationInfo(BOOSTER);
    await settled(BOOSTER, 'ready');

    expect(fetchApplicationInfo).toHaveBeenCalledTimes(2);
  });
});

describe('invalidateApplicationInfo', () => {
  // An open panel asks again because its entry went missing — that part is `useApplicationInfo`,
  // and a hook needs a renderer this suite does not have.
  it('forgets the entry, so the next ask reaches the server', async () => {
    answersWith(() => info('/webapp/before'));
    ensureApplicationInfo(BOOSTER);
    await settled(BOOSTER, 'ready');

    invalidateApplicationInfo(BOOSTER);

    expect($applicationsInfo.get()[BOOSTER]).toBeUndefined();

    answersWith(() => info('/webapp/after'));
    ensureApplicationInfo(BOOSTER);
    await settled(BOOSTER, 'ready');

    expect(fetchApplicationInfo).toHaveBeenCalledTimes(2);
    expect($applicationsInfo.get()[BOOSTER]?.info?.deploymentUrl).toBe('/webapp/after');
  });

  it('drops an answer that is already in flight', async () => {
    let answerSlowly: ((info: ApplicationInfo) => void) | undefined;
    vi.mocked(fetchApplicationInfo).mockReturnValueOnce(
      ResultAsync.fromSafePromise(
        new Promise<ApplicationInfo>((resolve) => {
          answerSlowly = resolve;
        }),
      ),
    );

    ensureApplicationInfo(BOOSTER);
    invalidateApplicationInfo(BOOSTER);
    answerSlowly?.(info('/webapp/stale'));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect($applicationsInfo.get()[BOOSTER]?.info?.deploymentUrl).not.toBe('/webapp/stale');
  });

  it('does nothing for a key it holds no entry for', () => {
    invalidateApplicationInfo('com.example.unknown');

    expect($applicationsInfo.get()).toEqual({});
    expect(fetchApplicationInfo).not.toHaveBeenCalled();
  });
});

describe('two applications', () => {
  it('keeps an entry per key, so stepping back and forth costs one request each', async () => {
    answersWith((key) => info(`/webapp/${key}`));

    ensureApplicationInfo(BOOSTER);
    await settled(BOOSTER, 'ready');
    ensureApplicationInfo(FATHOM);
    await settled(FATHOM, 'ready');
    ensureApplicationInfo(BOOSTER);

    expect(fetchApplicationInfo).toHaveBeenCalledTimes(2);
    expect($applicationsInfo.get()[BOOSTER]?.info?.deploymentUrl).toBe(`/webapp/${BOOSTER}`);
    expect($applicationsInfo.get()[FATHOM]?.info?.deploymentUrl).toBe(`/webapp/${FATHOM}`);
  });
});
