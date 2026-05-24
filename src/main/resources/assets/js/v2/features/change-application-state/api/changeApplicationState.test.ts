import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {startApplications, stopApplications} from './changeApplicationState';

function mockFetchOnce(body: unknown, init: ResponseInit = {status: 200}) {
    const response = new Response(typeof body === 'string' ? body : JSON.stringify(body), {
        headers: {'Content-Type': 'application/json'},
        ...init,
    });
    return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response);
}

describe('features/change-application-state/api', () => {
    beforeEach(() => {
        CONFIG.setConfig({
            serverAppApi: {
                start: 'https://example.com/admin/start',
                stop: 'https://example.com/admin/stop',
            },
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        CONFIG.setConfig({});
    });

    describe.each([
        ['startApplications', 'start', startApplications],
        ['stopApplications', 'stop', stopApplications],
    ] as const)('%s', (operation, action, fn) => {
        it(`POSTs ${action} URL with {key: [...]} body`, async () => {
            const fetchMock = mockFetchOnce('', {status: 200});

            await fn(['com.enonic.app.demo']);

            expect(fetchMock).toHaveBeenCalledTimes(1);
            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe(`https://example.com/admin/${action}`);
            expect(init?.method).toBe('POST');
            expect(init?.headers).toMatchObject({
                'Content-Type': 'application/json;charset=UTF-8',
                Accept: 'application/json',
            });
            expect(JSON.parse(init?.body as string)).toEqual({key: ['com.enonic.app.demo']});
        });

        it('is a no-op when keys is empty', async () => {
            const fetchMock = vi.spyOn(globalThis, 'fetch');
            await fn([]);
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('throws AppError on HTTP error', async () => {
            mockFetchOnce(JSON.stringify({message: 'failed'}), {status: 500});

            await expect(fn(['com.enonic.app.demo'])).rejects.toMatchObject({
                name: 'AppError',
                message: 'failed',
                status: 500,
                operation,
            });
        });
    });
});
