import { afterEach, describe, expect, it, vi } from 'vitest';

import { requestUploadJson } from './upload';

type ProgressEvent = { lengthComputable: boolean; loaded: number; total: number };

type StubOptions = {
  status?: number;
  statusText?: string;
  responseText?: string;
  /** What the browser reports on the way out, as `[loaded, total]` pairs. */
  progress?: readonly (readonly [number, number])[];
  /** Report progress the browser cannot measure — a body of unknown length. */
  unmeasurable?: boolean;
  /** Fail the transport instead of answering. */
  networkError?: boolean;
};

const INSTALLED = '{"key":"com.example.app","version":"1.0.0"}';

const sent: { method?: string; url?: string; body?: unknown } = {};

// Enough of XMLHttpRequest for this helper: what it opens, what it sends, and the two callbacks it
// sets. `send` drives the whole exchange synchronously, so no test has to wait on a tick.
function stubXhr({
  status = 200,
  statusText = 'OK',
  responseText = INSTALLED,
  progress = [],
  unmeasurable = false,
  networkError = false,
}: StubOptions = {}): void {
  const xhr = {
    status,
    statusText,
    responseText,
    upload: {} as { onprogress?: (event: ProgressEvent) => void },
    onload: undefined as (() => void) | undefined,
    onerror: undefined as (() => void) | undefined,

    open(method: string, url: string) {
      sent.method = method;
      sent.url = url;
    },

    send(body: unknown) {
      sent.body = body;

      progress.forEach(([loaded, total]) =>
        xhr.upload.onprogress?.({ lengthComputable: !unmeasurable, loaded, total }),
      );

      if (networkError) {
        xhr.onerror?.();
        return;
      }

      xhr.onload?.();
    },
  };

  // A constructor, not an arrow: the helper calls `new XMLHttpRequest()`, and a function returning
  // an object hands that object back from `new`.
  vi.stubGlobal('XMLHttpRequest', function XhrStub() {
    return xhr;
  });
}

function jarForm(): FormData {
  const formData = new FormData();
  formData.append('file', new Blob(['jar']), 'app.jar');
  return formData;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('requestUploadJson', () => {
  it('posts the multipart body to the given url', async () => {
    stubXhr();

    const result = await requestUploadJson('/_/server:app/install', { formData: jarForm() });

    expect(result._unsafeUnwrap()).toEqual({ key: 'com.example.app', version: '1.0.0' });
    expect(sent.method).toBe('POST');
    expect(sent.url).toBe('/_/server:app/install');
    expect(sent.body).toBeInstanceOf(FormData);
  });

  it('reports what has gone out, then 100 once the answer has arrived', async () => {
    stubXhr({ progress: [[25, 100]] });
    const seen: number[] = [];

    await requestUploadJson('/api', {
      formData: jarForm(),
      onProgress: (percent) => seen.push(percent),
    });

    expect(seen).toEqual([25, 100]);
  });

  it('holds progress below 100 while the server is still installing', async () => {
    stubXhr({ progress: [[100, 100]] });
    const seen: number[] = [];

    await requestUploadJson('/api', {
      formData: jarForm(),
      onProgress: (percent) => seen.push(percent),
    });

    expect(seen).toEqual([99, 100]);
  });

  it('ignores progress the browser cannot measure', async () => {
    stubXhr({ progress: [[50, 0]], unmeasurable: true });
    const seen: number[] = [];

    await requestUploadJson('/api', {
      formData: jarForm(),
      onProgress: (percent) => seen.push(percent),
    });

    expect(seen).toEqual([100]);
  });

  it('fails with the server-supplied message on an error status', async () => {
    stubXhr({
      status: 400,
      statusText: 'Bad Request',
      responseText: '{"message":"Missing file item"}',
    });

    const result = await requestUploadJson('/api', { formData: jarForm() });

    expect(result._unsafeUnwrapErr().message).toBe('Missing file item');
  });

  it('falls back to the status text when the error body carries no message', async () => {
    stubXhr({ status: 500, statusText: 'Internal Server Error', responseText: 'not json' });

    const result = await requestUploadJson('/api', { formData: jarForm() });

    expect(result._unsafeUnwrapErr().message).toBe('Internal Server Error');
  });

  it('fails when a successful answer is not JSON', async () => {
    stubXhr({ responseText: '<html>' });

    const result = await requestUploadJson('/api', { formData: jarForm() });

    expect(result._unsafeUnwrapErr().message).toMatch(/other than JSON/);
  });

  it('fails when the transport does', async () => {
    stubXhr({ networkError: true });

    const result = await requestUploadJson('/api', { formData: jarForm() });

    expect(result._unsafeUnwrapErr().message).toBe('Network error');
  });

  it('reports no progress at all when the request never gets off the ground', async () => {
    stubXhr({ networkError: true });
    const onProgress = vi.fn();

    await requestUploadJson('/api', { formData: jarForm(), onProgress });

    expect(onProgress).not.toHaveBeenCalled();
  });
});
