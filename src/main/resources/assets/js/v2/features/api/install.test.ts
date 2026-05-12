import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {installApplicationFromUrl, uploadApplication} from './install';

function mockFetchOnce(body: unknown, init: ResponseInit = {status: 200}) {
    const response = new Response(typeof body === 'string' ? body : JSON.stringify(body), {
        headers: {'Content-Type': 'application/json'},
        ...init,
    });
    return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response);
}

//
// * XHR test double
//

type XhrListenerMap = Record<string, EventListener[]>;

interface FakeXhr {
    open: ReturnType<typeof vi.fn>;
    send: ReturnType<typeof vi.fn>;
    setRequestHeader: ReturnType<typeof vi.fn>;
    abort: ReturnType<typeof vi.fn>;
    addEventListener: (event: string, cb: EventListener) => void;
    upload: {
        addEventListener: (event: string, cb: EventListener) => void;
        listeners: XhrListenerMap;
    };
    listeners: XhrListenerMap;
    status: number;
    responseText: string;
    /** Helper: fire a fake load with a status and body. */
    fakeLoad(status: number, body?: string): void;
    /** Helper: fire a network error. */
    fakeError(): void;
    /** Helper: fire progress on the upload. */
    fakeProgress(loaded: number, total: number, lengthComputable?: boolean): void;
}

function makeFakeXhr(): FakeXhr {
    const listeners: XhrListenerMap = {};
    const uploadListeners: XhrListenerMap = {};
    const fake: FakeXhr = {
        listeners,
        status: 0,
        responseText: '',
        open: vi.fn(),
        send: vi.fn(),
        setRequestHeader: vi.fn(),
        abort: vi.fn(),
        addEventListener(event: string, cb: EventListener) {
            (listeners[event] ??= []).push(cb);
        },
        upload: {
            listeners: uploadListeners,
            addEventListener(event: string, cb: EventListener) {
                (uploadListeners[event] ??= []).push(cb);
            },
        },
        fakeLoad(status: number, body = '') {
            fake.status = status;
            fake.responseText = body;
            (listeners.load ?? []).forEach((cb) => cb(new Event('load')));
        },
        fakeError() {
            (listeners.error ?? []).forEach((cb) => cb(new Event('error')));
        },
        fakeProgress(loaded: number, total: number, lengthComputable = true) {
            const event = {loaded, total, lengthComputable} as ProgressEvent;
            (uploadListeners.progress ?? []).forEach((cb) => cb(event as unknown as Event));
        },
    };
    fake.abort = vi.fn(() => {
        (listeners.abort ?? []).forEach((cb) => cb(new Event('abort')));
    });
    return fake;
}

function installFakeXhr(): {instances: FakeXhr[]; restore: () => void} {
    const instances: FakeXhr[] = [];

    const FakeCtor = function () {
        const xhr = makeFakeXhr();
        instances.push(xhr);
        return xhr;
    } as unknown as typeof XMLHttpRequest;

    const original = globalThis.XMLHttpRequest;
    globalThis.XMLHttpRequest = FakeCtor;

    return {
        instances,
        restore: () => {
            globalThis.XMLHttpRequest = original;
        },
    };
}

//
// * Tests
//

describe('api/install', () => {
    beforeEach(() => {
        CONFIG.setConfig({
            serverAppApi: {
                install: 'https://example.com/admin/install',
                installUrl: 'https://example.com/admin/installUrl',
            },
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        CONFIG.setConfig({});
    });

    describe('installApplicationFromUrl', () => {
        it('POSTs URL and sha512 in JSON body', async () => {
            const fetchMock = mockFetchOnce({applicationInstalledJson: {key: 'a'}});

            const result = await installApplicationFromUrl('https://files.example/app.jar', 'abc');

            expect(fetchMock).toHaveBeenCalledTimes(1);
            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe('https://example.com/admin/installUrl');
            expect(init?.method).toBe('POST');
            expect(init?.headers).toMatchObject({
                Accept: 'application/json',
                'Content-Type': 'application/json;charset=UTF-8',
            });
            expect(JSON.parse(init?.body as string)).toEqual({URL: 'https://files.example/app.jar', sha512: 'abc'});
            expect(init?.signal).toBeUndefined();
            expect(result).toEqual({applicationInstalledJson: {key: 'a'}});
        });

        it('omits sha512 when not provided', async () => {
            const fetchMock = mockFetchOnce({});

            await installApplicationFromUrl('https://files.example/app.jar');

            const init = fetchMock.mock.calls[0][1];
            expect(JSON.parse(init?.body as string)).toEqual({URL: 'https://files.example/app.jar'});
        });

        it('throws AppError on HTTP error', async () => {
            mockFetchOnce(JSON.stringify({message: 'bad url'}), {status: 400});

            await expect(installApplicationFromUrl('bad')).rejects.toMatchObject({
                name: 'AppError',
                message: 'bad url',
                status: 400,
                operation: 'installApplicationFromUrl',
            });
        });
    });

    describe('uploadApplication', () => {
        const FILE = new File(['hello'], 'demo.jar', {type: 'application/java-archive'});

        it('POSTs to the install URL with the file in multipart form data', async () => {
            const fake = installFakeXhr();
            try {
                const promise = uploadApplication(FILE);
                const [xhr] = fake.instances;
                expect(xhr.open).toHaveBeenCalledWith('POST', 'https://example.com/admin/install');
                expect(xhr.setRequestHeader).toHaveBeenCalledWith('Accept', 'application/json');

                const [formData] = xhr.send.mock.calls[0] as [FormData];
                expect(formData).toBeInstanceOf(FormData);
                const sent = formData.get('file') as File;
                expect(sent.name).toBe('demo.jar');

                xhr.fakeLoad(200, JSON.stringify({applicationInstalledJson: {key: 'a'}}));

                await expect(promise).resolves.toEqual({applicationInstalledJson: {key: 'a'}});
            } finally {
                fake.restore();
            }
        });

        it('reports progress through onProgress', async () => {
            const fake = installFakeXhr();
            try {
                const events: {loaded: number; total: number}[] = [];
                const promise = uploadApplication(FILE, {onProgress: (e) => events.push(e)});
                const [xhr] = fake.instances;

                xhr.fakeProgress(10, 100);
                xhr.fakeProgress(50, 100);
                xhr.fakeProgress(80, 0, false);

                xhr.fakeLoad(200, '{}');
                await promise;

                expect(events).toEqual([
                    {loaded: 10, total: 100},
                    {loaded: 50, total: 100},
                    {loaded: 80, total: 0},
                ]);
            } finally {
                fake.restore();
            }
        });

        it('rejects with AppError when the server responds 4xx', async () => {
            const fake = installFakeXhr();
            try {
                const promise = uploadApplication(FILE);
                const [xhr] = fake.instances;
                xhr.fakeLoad(415, JSON.stringify({message: 'unsupported'}));

                await expect(promise).rejects.toMatchObject({
                    name: 'AppError',
                    message: 'unsupported',
                    status: 415,
                    operation: 'uploadApplication',
                });
            } finally {
                fake.restore();
            }
        });

        it('rejects on network error', async () => {
            const fake = installFakeXhr();
            try {
                const promise = uploadApplication(FILE);
                const [xhr] = fake.instances;
                xhr.fakeError();
                await expect(promise).rejects.toMatchObject({
                    name: 'AppError',
                    operation: 'uploadApplication',
                });
            } finally {
                fake.restore();
            }
        });

        it('aborts when signal fires', async () => {
            const fake = installFakeXhr();
            try {
                const controller = new AbortController();
                const promise = uploadApplication(FILE, {signal: controller.signal});
                const [xhr] = fake.instances;
                controller.abort();
                expect(xhr.abort).toHaveBeenCalled();
                await expect(promise).rejects.toMatchObject({
                    name: 'AppError',
                    operation: 'uploadApplication',
                });
            } finally {
                fake.restore();
            }
        });
    });
});
