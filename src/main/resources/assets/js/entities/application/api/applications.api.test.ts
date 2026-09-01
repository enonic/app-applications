import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setGraphQlEndpoint } from '../../../shared/api';
import { $config, type Config, setConfig } from '../../../shared/config';
import {
  fetchApplication,
  fetchApplications,
  postInstallApplicationFromFile,
  postInstallApplicationFromUrl,
} from './applications.api';

// The section's own data plane, which `mount` sets from `host.baseUrl` rather than reading off a
// tool config: there is no page of ours to carry one.
const ENDPOINT = '/admin/tool/com.enonic.xp.app.applications/applications/graphql';

function respondWith(body: unknown): void {
  globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify(body)));
}

// The install endpoints are XP core's, not this section's data plane: their base comes off the
// section's own configuration, which its server built.
const CONFIG = {
  appId: 'com.enonic.xp.app.applications',
  appVersion: '1.0.0',
  eventsUrl: '/_/admin:events',
  managedMode: false,
  serverAppUrl: '/_/server:app',
} satisfies Config;

describe('fetchApplications', () => {
  beforeEach(() => {
    setGraphQlEndpoint(ENDPOINT);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps the wire rows to applications', async () => {
    respondWith({
      data: {
        applications: [
          {
            key: 'com.enonic.app.booster',
            displayName: 'Booster',
            description: 'Caches rendered pages',
            version: '1.2.0',
            state: 'STARTED',
            system: false,
            local: false,
            icon: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
            modifiedTime: '2026-05-07T12:42:39Z',
            minSystemVersion: '7.15.0',
            maxSystemVersion: null,
            vendorName: 'Enonic AS',
            vendorUrl: 'https://enonic.com',
          },
        ],
      },
    });

    const result = await fetchApplications();

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual([
      {
        key: 'com.enonic.app.booster',
        displayName: 'Booster',
        description: 'Caches rendered pages',
        version: '1.2.0',
        state: 'STARTED',
        system: false,
        local: false,
        icon: 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=',
        modifiedTime: '2026-05-07T12:42:39Z',
        minSystemVersion: '7.15.0',
        maxSystemVersion: undefined,
        vendorName: 'Enonic AS',
        vendorUrl: 'https://enonic.com',
      },
    ]);
  });

  it('turns the nulls the schema allows into absent fields', async () => {
    respondWith({
      data: {
        applications: [
          {
            key: 'com.enonic.app.fathom',
            displayName: 'Fathom',
            description: null,
            version: null,
            state: 'STOPPED',
            system: true,
            local: true,
            icon: null,
            modifiedTime: null,
            minSystemVersion: null,
            maxSystemVersion: null,
            vendorName: null,
            vendorUrl: null,
          },
        ],
      },
    });

    const result = await fetchApplications();

    expect(result._unsafeUnwrap()).toEqual([
      {
        key: 'com.enonic.app.fathom',
        displayName: 'Fathom',
        description: undefined,
        version: undefined,
        state: 'STOPPED',
        system: true,
        local: true,
        icon: undefined,
        modifiedTime: undefined,
        minSystemVersion: undefined,
        maxSystemVersion: undefined,
        vendorName: undefined,
        vendorUrl: undefined,
      },
    ]);
  });

  it('fails with the message a GraphQL error carries', async () => {
    respondWith({ errors: [{ message: 'No such field' }] });

    const result = await fetchApplications();

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().message).toBe('No such field');
  });
});

describe('fetchApplication', () => {
  beforeEach(() => {
    setGraphQlEndpoint(ENDPOINT);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps the wire row to an application', async () => {
    respondWith({
      data: {
        application: {
          key: 'com.enonic.app.booster',
          displayName: 'Booster',
          description: null,
          version: '1.2.0',
          state: 'STOPPED',
          system: false,
          icon: null,
          modifiedTime: null,
          minSystemVersion: null,
          maxSystemVersion: null,
        },
      },
    });

    const result = await fetchApplication('com.enonic.app.booster');

    expect(result._unsafeUnwrap()).toMatchObject({
      key: 'com.enonic.app.booster',
      displayName: 'Booster',
      state: 'STOPPED',
    });
  });

  it('resolves to undefined for an application that is not installed', async () => {
    respondWith({ data: { application: null } });

    const result = await fetchApplication('com.enonic.app.gone');

    expect(result._unsafeUnwrap()).toBeUndefined();
  });
});

describe('postInstallApplicationFromUrl', () => {
  const DOWNLOAD_URL = 'https://repo.enonic.com/booster-3.0.1.jar';

  beforeEach(() => {
    setConfig(CONFIG);
  });

  afterEach(() => {
    $config.set(undefined);
    vi.restoreAllMocks();
  });

  it('posts the download url under the uppercase field core binds', async () => {
    respondWith({ key: 'com.enonic.app.booster', version: '3.0.1' });

    await postInstallApplicationFromUrl({ url: DOWNLOAD_URL, sha512: 'abc' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/_/server:app/installUrl',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ URL: DOWNLOAD_URL, sha512: 'abc' }),
      }),
    );
  });

  it('leaves the checksum out where the market published none', async () => {
    respondWith({ key: 'com.enonic.app.booster', version: '3.0.1' });

    await postInstallApplicationFromUrl({ url: DOWNLOAD_URL });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/_/server:app/installUrl',
      expect.objectContaining({ body: JSON.stringify({ URL: DOWNLOAD_URL }) }),
    );
  });

  it('answers with the key and version core installed, which the market need not have listed', async () => {
    respondWith({
      key: 'com.enonic.app.booster',
      version: '3.0.1',
      title: 'Booster',
      state: 'started',
      local: false,
    });

    const result = await postInstallApplicationFromUrl({ url: DOWNLOAD_URL, sha512: 'abc' });

    expect(result._unsafeUnwrap()).toEqual({
      key: 'com.enonic.app.booster',
      version: '3.0.1',
      displayName: 'Booster',
    });
  });

  // The reason a refused install is worth naming: core's message is what tells an operator whether
  // the url was outside the allowlist or the checksum was missing.
  it('fails with the reason core gave', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response('{"message":"SHA512 checksum is required for installUrl"}', { status: 409 }),
      );

    const result = await postInstallApplicationFromUrl({ url: DOWNLOAD_URL });

    expect(result._unsafeUnwrapErr().message).toBe('SHA512 checksum is required for installUrl');
  });

  it('fails before the request when the configuration is not read yet', async () => {
    $config.set(undefined);
    globalThis.fetch = vi.fn();

    const result = await postInstallApplicationFromUrl({ url: DOWNLOAD_URL });

    expect(result.isErr()).toBe(true);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });
});

describe('postInstallApplicationFromFile', () => {
  const jar = new File(['jar bytes'], 'booster-3.0.1.jar');

  const sent: { url?: string; formData?: FormData } = {};

  // The upload goes over XHR rather than fetch, so this stubs the constructor the helper reaches for.
  function respondWithUpload(status: number, responseText: string): void {
    const xhr = {
      status,
      statusText: status === 200 ? 'OK' : 'Bad Request',
      responseText,
      upload: {} as { onprogress?: (event: unknown) => void },
      onload: undefined as (() => void) | undefined,
      onerror: undefined as (() => void) | undefined,
      open(_method: string, url: string) {
        sent.url = url;
      },
      send(body: FormData) {
        sent.formData = body;
        xhr.onload?.();
      },
    };

    vi.stubGlobal('XMLHttpRequest', function XhrStub() {
      return xhr;
    });
  }

  beforeEach(() => {
    setConfig(CONFIG);
  });

  afterEach(() => {
    $config.set(undefined);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // ! Core reads this one field name and answers `Missing file item` for any other.
  it('posts the jar to the install endpoint under the field name core binds', async () => {
    respondWithUpload(200, '{"key":"com.enonic.app.booster","version":"3.0.1","title":"Booster"}');

    await postInstallApplicationFromFile({ file: jar });

    expect(sent.url).toBe('/_/server:app/install');
    expect(sent.formData?.get('file')).toBe(jar);
  });

  it('answers with the application core built out of the jar', async () => {
    respondWithUpload(200, '{"key":"com.enonic.app.booster","version":"3.0.1","title":"Booster"}');

    const result = await postInstallApplicationFromFile({ file: jar });

    expect(result._unsafeUnwrap()).toEqual({
      key: 'com.enonic.app.booster',
      version: '3.0.1',
      displayName: 'Booster',
    });
  });

  // Core omits a null title rather than sending one, so an app with no descriptor title has none.
  it('names an application without a descriptor title by its key', async () => {
    respondWithUpload(200, '{"key":"com.enonic.app.booster","version":"3.0.1"}');

    const result = await postInstallApplicationFromFile({ file: jar });

    expect(result._unsafeUnwrap().displayName).toBe('com.enonic.app.booster');
  });

  it('fails with the reason core gave for refusing the jar', async () => {
    respondWithUpload(400, '{"message":"Missing file item"}');

    const result = await postInstallApplicationFromFile({ file: jar });

    expect(result._unsafeUnwrapErr().message).toBe('Missing file item');
  });

  it('fails before the request when the configuration is not read yet', async () => {
    $config.set(undefined);
    respondWithUpload(200, '{}');
    sent.url = undefined;

    const result = await postInstallApplicationFromFile({ file: jar });

    expect(result.isErr()).toBe(true);
    expect(sent.url).toBeUndefined();
  });
});
