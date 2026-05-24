import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {uninstallApplications} from './uninstall';

function mockFetchOnce(body: unknown, init: ResponseInit = {status: 200}) {
    const response = new Response(typeof body === 'string' ? body : JSON.stringify(body), {
        headers: {'Content-Type': 'application/json'},
        ...init,
    });
    return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response);
}

describe('features/uninstall-app/api/uninstall', () => {
    beforeEach(() => {
        CONFIG.setConfig({
            serverAppApi: {
                uninstall: 'https://example.com/admin/uninstall',
            },
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        CONFIG.setConfig({});
    });

    it('POSTs the uninstall URL with {key: [...]} body', async () => {
        const fetchMock = mockFetchOnce('', {status: 200});

        await uninstallApplications(['com.enonic.app.demo']);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('https://example.com/admin/uninstall');
        expect(init?.method).toBe('POST');
        expect(init?.headers).toMatchObject({
            'Content-Type': 'application/json;charset=UTF-8',
            Accept: 'application/json',
        });
        expect(JSON.parse(init?.body as string)).toEqual({key: ['com.enonic.app.demo']});
    });

    it('is a no-op when keys is empty', async () => {
        const fetchMock = vi.spyOn(globalThis, 'fetch');
        await uninstallApplications([]);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('throws AppError on HTTP error', async () => {
        mockFetchOnce(JSON.stringify({message: 'failed'}), {status: 500});

        await expect(uninstallApplications(['com.enonic.app.demo'])).rejects.toMatchObject({
            name: 'AppError',
            message: 'failed',
            status: 500,
            operation: 'uninstallApplications',
        });
    });
});
