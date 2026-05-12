import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {listMarketApplications} from './market';

function mockFetchOnce(body: unknown, init: ResponseInit = {status: 200}) {
    const response = new Response(typeof body === 'string' ? body : JSON.stringify(body), {
        headers: {'Content-Type': 'application/json'},
        ...init,
    });
    return vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(response);
}

const MARKET_ITEM = {
    _id: 'id-1',
    displayName: 'Demo',
    pageUrl: 'https://market.example/demo',
    type: 'com_enonic_app_market_Application',
    data: {
        version: [
            {
                versionNumber: '1.0.0',
                supportedVersions: '7.0.0',
                sha512: 'a',
                downloadUrl: 'https://files.example/1.0.0.jar',
            },
            {
                versionNumber: '2.0.0',
                supportedVersions: ['7.0.0', '8.0.0'],
                sha512: 'b',
                downloadUrl: 'https://files.example/2.0.0.jar',
            },
        ],
        icon: {attachmentUrl: 'https://icons.example/demo.png'},
        vendor: 'Enonic',
        shortDescription: 'A demo app',
        identifier: 'com.enonic.app.demo',
    },
};

describe('api/market', () => {
    beforeEach(() => {
        CONFIG.setConfig({
            marketApi: 'https://market.example.com/graphql',
            xpVersion: '7.15.0',
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        CONFIG.setConfig({});
    });

    it('POSTs the GraphQL query to the market URL without credentials', async () => {
        const fetchMock = mockFetchOnce({data: {market: {queryDsl: []}}});

        await listMarketApplications();

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('https://market.example.com/graphql');
        expect(init?.method).toBe('POST');
        expect(init?.headers).toMatchObject({
            Accept: 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
        });
        expect(init?.credentials).toBe('omit');
        const body = JSON.parse(init?.body as string);
        expect(body.query).toMatch(/com\.enonic\.app\.market:application/);
        expect(body.query).toMatch(/7\.\*/);
    });

    it('maps a market item to MarketItemDto and keeps the highest supported version', async () => {
        mockFetchOnce({data: {market: {queryDsl: [MARKET_ITEM]}}});

        const items = await listMarketApplications();

        expect(items).toHaveLength(1);
        expect(items[0]).toEqual({
            key: 'com.enonic.app.demo',
            displayName: 'Demo',
            description: 'A demo app',
            iconUrl: 'https://icons.example/demo.png',
            vendorName: 'Enonic',
            vendorUrl: '',
            url: 'https://market.example/demo',
            latestVersion: '2.0.0',
            downloadUrl: 'https://files.example/2.0.0.jar',
            sha512: 'b',
            installed: false,
        });
    });

    it('skips items with no supported version for current XP', async () => {
        const item = {
            ...MARKET_ITEM,
            data: {
                ...MARKET_ITEM.data,
                version: [{versionNumber: '0.1.0', supportedVersions: '8.0.0', downloadUrl: 'x'}],
            },
        };
        mockFetchOnce({data: {market: {queryDsl: [item]}}});

        const items = await listMarketApplications();

        expect(items).toEqual([]);
    });

    it('derives key from groupId.artifactId when identifier is missing', async () => {
        const item = {
            ...MARKET_ITEM,
            data: {
                ...MARKET_ITEM.data,
                identifier: undefined,
                groupId: 'com.enonic.app',
                artifactId: 'demo',
            },
        };
        mockFetchOnce({data: {market: {queryDsl: [item]}}});

        const [dto] = await listMarketApplications();
        expect(dto.key).toBe('com.enonic.app.demo');
    });

    it('throws AppError on HTTP error', async () => {
        mockFetchOnce('', {status: 500});

        await expect(listMarketApplications()).rejects.toMatchObject({
            name: 'AppError',
            status: 500,
            operation: 'listMarketApplications',
        });
    });

    it('throws AppError when GraphQL returns errors', async () => {
        mockFetchOnce({errors: [{message: 'something broke'}]});

        await expect(listMarketApplications()).rejects.toMatchObject({
            name: 'AppError',
            message: 'something broke',
            operation: 'listMarketApplications',
        });
    });

    it('uses an explicit version parameter when provided', async () => {
        const fetchMock = mockFetchOnce({data: {market: {queryDsl: []}}});

        await listMarketApplications(undefined, '8.0.0');

        const body = JSON.parse(fetchMock.mock.calls[0][1]?.body as string);
        expect(body.query).toMatch(/8\.\*/);
    });
});
