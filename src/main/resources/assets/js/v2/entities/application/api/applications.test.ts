import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {getApplication, getApplicationInfo, listApplications} from './applications';

function mockFetchOnce(body: unknown, init: ResponseInit = {status: 200}) {
    const response = new Response(typeof body === 'string' ? body : JSON.stringify(body), {
        headers: {'Content-Type': 'application/json'},
        ...init,
    });
    return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response);
}

const APP_JSON = {
    key: 'com.enonic.app.demo',
    version: '1.2.3',
    displayName: '',
    title: 'Demo App',
    description: 'A demo',
    info: '',
    url: 'https://demo.example.com',
    vendorName: 'Enonic',
    vendorUrl: 'https://enonic.com',
    state: 'started',
    config: undefined,
    idProviderConfig: undefined,
    applicationDependencies: [],
    contentTypeDependencies: [],
    metaSteps: [],
    minSystemVersion: '7.0.0',
    maxSystemVersion: '8.0.0',
    local: false,
    iconUrl: '/icons/demo',
    system: false,
};

describe('entities/application/api/applications', () => {
    beforeEach(() => {
        CONFIG.setConfig({});
    });

    afterEach(() => {
        vi.restoreAllMocks();
        CONFIG.setConfig({});
    });

    describe('listApplications', () => {
        it('GETs /admin/rest-v2/apps/application/list and maps the response to DTOs', async () => {
            const fetchMock = mockFetchOnce({applications: [APP_JSON]});

            const dtos = await listApplications();

            expect(fetchMock).toHaveBeenCalledTimes(1);
            const [url, init] = fetchMock.mock.calls[0];
            expect(url).toBe('/admin/rest-v2/apps/application/list');
            expect(init?.headers).toMatchObject({Accept: 'application/json'});

            expect(dtos).toHaveLength(1);
            expect(dtos[0]).toMatchObject({
                key: 'com.enonic.app.demo',
                name: 'demo',
                displayName: 'Demo App',
                version: '1.2.3',
                state: 'started',
                vendorName: 'Enonic',
            });
        });

        it('appends ?query=… when filter is provided', async () => {
            const fetchMock = mockFetchOnce({applications: []});

            await listApplications('hello world');

            expect(fetchMock.mock.calls[0][0]).toBe(
                '/admin/rest-v2/apps/application/list?query=hello%20world',
            );
        });

        it('throws AppError with parsed message on HTTP error', async () => {
            mockFetchOnce(JSON.stringify({message: 'denied'}), {status: 403});

            await expect(listApplications()).rejects.toMatchObject({
                name: 'AppError',
                message: 'denied',
                status: 403,
                operation: 'listApplications',
            });
        });
    });

    describe('getApplication', () => {
        it('GETs /admin/rest-v2/apps/application?applicationKey=… (no client timeout)', async () => {
            const fetchMock = mockFetchOnce(APP_JSON);

            const dto = await getApplication('com.enonic.app.demo');

            expect(fetchMock.mock.calls[0][0]).toBe(
                '/admin/rest-v2/apps/application?applicationKey=com.enonic.app.demo',
            );
            const init = fetchMock.mock.calls[0][1];
            expect(init?.signal).toBeUndefined();

            expect(dto.displayName).toBe('Demo App');
        });

        it('throws AppError on HTTP error', async () => {
            mockFetchOnce('', {status: 404});

            await expect(getApplication('missing')).rejects.toMatchObject({
                name: 'AppError',
                status: 404,
                operation: 'getApplication',
            });
        });
    });

    describe('getApplicationInfo', () => {
        it('GETs /admin/rest-v2/apps/application/info?applicationKey=…', async () => {
            const fetchMock = mockFetchOnce({tasks: {tasks: []}});

            const info = await getApplicationInfo('com.enonic.app.demo');

            expect(fetchMock.mock.calls[0][0]).toBe(
                '/admin/rest-v2/apps/application/info?applicationKey=com.enonic.app.demo',
            );
            expect(info).toBeDefined();
        });

        it('throws AppError on HTTP error', async () => {
            mockFetchOnce('', {status: 500});

            await expect(getApplicationInfo('com.enonic.app.demo')).rejects.toMatchObject({
                name: 'AppError',
                status: 500,
                operation: 'getApplicationInfo',
            });
        });
    });

    describe('toDto edge cases', () => {
        it('falls back to displayName when title is missing', async () => {
            mockFetchOnce({applications: [{...APP_JSON, title: undefined, displayName: 'Fallback Name'}]});
            const [dto] = await listApplications();
            expect(dto.displayName).toBe('Fallback Name');
        });

        it('falls back to key when both title and displayName are missing', async () => {
            mockFetchOnce({applications: [{...APP_JSON, title: undefined, displayName: ''}]});
            const [dto] = await listApplications();
            expect(dto.displayName).toBe('com.enonic.app.demo');
        });

        it('maps unknown server state to "unknown"', async () => {
            mockFetchOnce({applications: [{...APP_JSON, state: 'whatever'}]});
            const [dto] = await listApplications();
            expect(dto.state).toBe('unknown');
        });

        it('honors the explicit system flag from the server', async () => {
            mockFetchOnce({applications: [{...APP_JSON, key: 'com.enonic.app.local', system: true}]});
            const [dto] = await listApplications();
            expect(dto.system).toBe(true);
        });
    });
});
