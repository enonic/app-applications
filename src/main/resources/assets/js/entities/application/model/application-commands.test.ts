import { errAsync, okAsync } from 'neverthrow';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '../../../shared/api';
import { setHost } from '../../../shared/host';
import { setPhrases } from '../../../shared/i18n';
import type { Host, Notification } from '../../../shared/sections';
import {
  postStartApplications,
  postStopApplications,
  postUninstallApplications,
} from '../api/application-lifecycle.api';
import {
  postInstallApplicationFromFile,
  postInstallApplicationFromUrl,
} from '../api/applications.api';
import {
  installApplication,
  startApplications,
  stopApplications,
  uninstallApplications,
  uploadApplication,
  uploadApplications,
} from './application-commands';
import { $applicationUploads, queueUploads } from './application-uploads.store';
import type { Application } from './application.types';
import { loadApplication, loadApplications } from './applications.load';

vi.mock('../api/application-lifecycle.api', () => ({
  postStartApplications: vi.fn(),
  postStopApplications: vi.fn(),
  postUninstallApplications: vi.fn(),
}));

// Only the one call is stubbed: the module also carries the reads, and the loader beside it is what
// this file asserts against.
vi.mock('../api/applications.api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/applications.api')>()),
  postInstallApplicationFromUrl: vi.fn(),
  postInstallApplicationFromFile: vi.fn(),
}));

vi.mock('./applications.load', () => ({
  loadApplication: vi.fn(),
  loadApplications: vi.fn(),
}));

function application(key: string, displayName: string): Application {
  return { key, displayName, state: 'STOPPED', system: false, local: false };
}

const booster = application('com.enonic.app.booster', 'Booster');
const fathom = application('com.enonic.app.fathom', 'Fathom');

// Every notification this section raises goes to the shell's toast stack, so what a command reported
// is read off the host it was handed rather than out of a store of ours.
const raised: Notification[] = [];

let release: () => void = () => {};

function notificationTexts(): string[] {
  return raised.map(({ message }) => message);
}

// The resync only runs with the socket down, so every test asserting it says so.
beforeEach(() => {
  raised.length = 0;
  release();
  release = setHost({
    notify: (n: Notification) => {
      raised.push(n);
      return () => {};
    },
    // ! `unknown` first: a double this small overlaps the contract too little for a direct cast.
  } as unknown as Host);
  setPhrases(
    {
      'applications.notify.startFailed': 'Could not start {0}',
      'applications.notify.stopFailed': 'Could not stop {0}',
      'applications.notify.uninstalled': '{0} was uninstalled',
      'applications.notify.uninstallFailed': 'Could not uninstall {0}',
      'applications.notify.installed': '{0} was installed',
      'applications.notify.installFailed': 'Could not install {0}: {1}',
      'applications.notify.updated': '{0} was updated',
      'applications.notify.updateFailed': 'Could not update {0}: {1}',
      'applications.notify.uploadFailed': 'Could not install {0}: {1}',
    },
    'en',
  );
  $applicationUploads.set({});
  vi.mocked(postInstallApplicationFromUrl).mockReset();
  vi.mocked(postInstallApplicationFromFile).mockReset();
  vi.mocked(postStartApplications).mockReset();
  vi.mocked(postStopApplications).mockReset();
  vi.mocked(postUninstallApplications).mockReset();
  vi.mocked(loadApplication).mockReset();
  vi.mocked(loadApplication).mockResolvedValue(undefined);
  vi.mocked(loadApplications).mockReset();
  vi.mocked(loadApplications).mockResolvedValue(undefined);
});

afterEach(() => {
  release();
});

describe('startApplications', () => {
  it('is silent on success and refetches the one row it changed', async () => {
    vi.mocked(postStartApplications).mockReturnValue(okAsync({ failedKeys: [] }));

    await startApplications([booster]);

    expect(postStartApplications).toHaveBeenCalledWith([booster.key]);
    expect(notificationTexts()).toEqual([]);
    expect(loadApplication).toHaveBeenCalledWith(booster.key);
    expect(loadApplications).not.toHaveBeenCalled();
  });

  it('reloads the whole list after a bulk action rather than one row at a time', async () => {
    vi.mocked(postStartApplications).mockReturnValue(okAsync({ failedKeys: [] }));

    await startApplications([booster, fathom]);

    expect(postStartApplications).toHaveBeenCalledWith([booster.key, fathom.key]);
    expect(loadApplications).toHaveBeenCalledTimes(1);
    expect(loadApplication).not.toHaveBeenCalled();
  });

  it('names the application the server refused to start, and resyncs only the one that started', async () => {
    vi.mocked(postStartApplications).mockReturnValue(okAsync({ failedKeys: [fathom.key] }));

    await startApplications([booster, fathom]);

    expect(notificationTexts()).toEqual(['Could not start Fathom']);
    expect(loadApplication).toHaveBeenCalledWith(booster.key);
    expect(loadApplications).not.toHaveBeenCalled();
  });

  it('refetches nothing when the server refused every target', async () => {
    vi.mocked(postStartApplications).mockReturnValue(
      okAsync({ failedKeys: [booster.key, fathom.key] }),
    );

    await startApplications([booster, fathom]);

    expect(loadApplication).not.toHaveBeenCalled();
    expect(loadApplications).not.toHaveBeenCalled();
  });

  it('reports every target when the request itself fails, and refetches nothing', async () => {
    vi.mocked(postStartApplications).mockReturnValue(errAsync(new AppError('Forbidden')));

    await startApplications([booster, fathom]);

    expect(notificationTexts()).toEqual(['Could not start Booster', 'Could not start Fathom']);
    expect(loadApplication).not.toHaveBeenCalled();
    expect(loadApplications).not.toHaveBeenCalled();
  });

  it('asks the server nothing for an empty target list', async () => {
    await startApplications([]);

    expect(postStartApplications).not.toHaveBeenCalled();
  });
});

describe('stopApplications', () => {
  it('names the application the server refused to stop', async () => {
    vi.mocked(postStopApplications).mockReturnValue(okAsync({ failedKeys: [booster.key] }));

    await stopApplications([booster]);

    expect(notificationTexts()).toEqual(['Could not stop Booster']);
  });
});

describe('installApplication', () => {
  const params = {
    displayName: 'Booster',
    url: 'https://repo.enonic.com/booster-3.0.1.jar',
    sha512: 'abc',
  };
  const installed = {
    key: 'com.enonic.app.booster',
    version: '3.0.1',
    displayName: 'Booster',
  };

  it('names what was installed and refetches the row core created', async () => {
    vi.mocked(postInstallApplicationFromUrl).mockReturnValue(okAsync(installed));

    const result = await installApplication(params);

    expect(postInstallApplicationFromUrl).toHaveBeenCalledWith({
      url: params.url,
      sha512: params.sha512,
    });
    expect(notificationTexts()).toEqual(['Booster was installed']);
    // Core's key, not the market's: they need not be the same, so the response decides.
    expect(loadApplication).toHaveBeenCalledWith(installed.key);
    expect(result._unsafeUnwrap()).toEqual(installed);
  });

  it('says updated rather than installed for an update', async () => {
    vi.mocked(postInstallApplicationFromUrl).mockReturnValue(okAsync(installed));

    await installApplication({ ...params, updating: true });

    expect(notificationTexts()).toEqual(['Booster was updated']);
  });

  // The allowlist and the checksum requirement are core's, and its message is the only thing that
  // says which of them refused — hence the reason in the phrase.
  it('reports the reason core gave, and refetches nothing', async () => {
    vi.mocked(postInstallApplicationFromUrl).mockReturnValue(
      errAsync(new AppError('SHA512 checksum is required for installUrl')),
    );

    const result = await installApplication(params);

    expect(notificationTexts()).toEqual([
      'Could not install Booster: SHA512 checksum is required for installUrl',
    ]);
    expect(loadApplication).not.toHaveBeenCalled();
    expect(result.isErr()).toBe(true);
  });

  it('reports a failed update as an update', async () => {
    vi.mocked(postInstallApplicationFromUrl).mockReturnValue(errAsync(new AppError('Conflict')));

    await installApplication({ ...params, updating: true });

    expect(notificationTexts()).toEqual(['Could not update Booster: Conflict']);
  });
});

describe('uploadApplication', () => {
  const jar = new File(['jar bytes'], 'booster-3.0.1.jar');
  const installed = {
    key: 'com.enonic.app.booster',
    version: '3.0.1',
    displayName: 'Booster',
  };

  // A jar's file name need not resemble the application inside it, so success names core's answer.
  it('names the application core built, not the file it came in', async () => {
    vi.mocked(postInstallApplicationFromFile).mockReturnValue(okAsync(installed));

    const result = await uploadApplication(jar, queueUploads([jar.name])[0]);

    expect(notificationTexts()).toEqual(['Booster was installed']);
    expect(loadApplication).toHaveBeenCalledWith(installed.key);
    expect(result._unsafeUnwrap()).toEqual(installed);
  });

  it('holds the upload while it runs and drops it once it has finished', async () => {
    const inFlight: Record<string, unknown>[] = [];
    vi.mocked(postInstallApplicationFromFile).mockImplementation(({ onProgress }) => {
      onProgress?.(40);
      inFlight.push({ ...$applicationUploads.get() });
      return okAsync(installed);
    });

    await uploadApplication(jar, queueUploads([jar.name])[0]);

    expect(Object.values(inFlight[0] ?? {})).toEqual([
      { fileName: 'booster-3.0.1.jar', percent: 40 },
    ]);
    expect($applicationUploads.get()).toEqual({});
  });

  // Core refused the jar before it became an application, so there is no name but the file's.
  it('names the file when core would not take it, and refetches nothing', async () => {
    vi.mocked(postInstallApplicationFromFile).mockReturnValue(
      errAsync(new AppError('Missing file item')),
    );

    const result = await uploadApplication(jar, queueUploads([jar.name])[0]);

    expect(notificationTexts()).toEqual(['Could not install booster-3.0.1.jar: Missing file item']);
    expect(loadApplication).not.toHaveBeenCalled();
    expect(result.isErr()).toBe(true);
  });

  it('drops the upload after a failure too, so no row is left behind', async () => {
    vi.mocked(postInstallApplicationFromFile).mockReturnValue(errAsync(new AppError('Conflict')));

    await uploadApplication(jar, queueUploads([jar.name])[0]);

    expect($applicationUploads.get()).toEqual({});
  });
});

describe('uploadApplications', () => {
  const jars = ['booster.jar', 'fathom.jar', 'juke.jar'].map((name) => new File(['bytes'], name));

  function uploadsPerCall(): Record<string, unknown>[][] {
    const seen: Record<string, unknown>[][] = [];
    vi.mocked(postInstallApplicationFromFile).mockImplementation(({ file }) => {
      seen.push(Object.values({ ...$applicationUploads.get() }) as Record<string, unknown>[]);
      return okAsync({ key: file.name, version: '1.0.0', displayName: file.name });
    });

    return seen;
  }

  // One going, two waiting — what the operator has to be able to see.
  it('shows the whole pick before the first jar has gone out', async () => {
    const seen = uploadsPerCall();

    await uploadApplications(jars);

    expect(seen[0]).toEqual([
      { fileName: 'booster.jar' },
      { fileName: 'fathom.jar' },
      { fileName: 'juke.jar' },
    ]);
  });

  it('sends them one at a time, in the order they were picked, and clears the list', async () => {
    const seen = uploadsPerCall();

    await uploadApplications(jars);

    expect(seen.map((uploads) => uploads.length)).toEqual([3, 2, 1]);
    expect(vi.mocked(postInstallApplicationFromFile).mock.calls.map(([{ file }]) => file.name)) //
      .toEqual(['booster.jar', 'fathom.jar', 'juke.jar']);
    expect($applicationUploads.get()).toEqual({});
  });

  // A name per jar, because the shell's toast stack collapses two identical texts into one.
  it('carries on after a jar core would not take', async () => {
    vi.mocked(postInstallApplicationFromFile)
      .mockImplementationOnce(() => errAsync(new AppError('Missing file item')))
      .mockImplementation(({ file }) =>
        okAsync({ key: file.name, version: '1.0.0', displayName: file.name }),
      );

    await uploadApplications(jars);

    expect(notificationTexts()).toEqual([
      'Could not install booster.jar: Missing file item',
      'fathom.jar was installed',
      'juke.jar was installed',
    ]);
    expect($applicationUploads.get()).toEqual({});
  });
});

describe('uninstallApplications', () => {
  it('names every application that went, unlike Start and Stop', async () => {
    vi.mocked(postUninstallApplications).mockReturnValue(okAsync({ failedKeys: [] }));

    await uninstallApplications([booster, fathom]);

    expect(notificationTexts()).toEqual(['Booster was uninstalled', 'Fathom was uninstalled']);
  });

  // The deploy-directory case: the server refuses one target and takes the other, and the pair of
  // toasts is the only place that shows up.
  it('reports the refused application and the one that went', async () => {
    vi.mocked(postUninstallApplications).mockReturnValue(okAsync({ failedKeys: [fathom.key] }));

    await uninstallApplications([booster, fathom]);

    expect(notificationTexts()).toEqual(['Could not uninstall Fathom', 'Booster was uninstalled']);
    expect(loadApplication).toHaveBeenCalledWith(booster.key);
  });

  it('claims nothing was uninstalled when the request itself fails', async () => {
    vi.mocked(postUninstallApplications).mockReturnValue(errAsync(new AppError('Forbidden')));

    await uninstallApplications([booster]);

    expect(notificationTexts()).toEqual(['Could not uninstall Booster']);
    expect(loadApplication).not.toHaveBeenCalled();
  });
});
