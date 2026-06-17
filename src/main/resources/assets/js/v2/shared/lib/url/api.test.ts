import {CONFIG} from '@enonic/lib-admin-ui/util/Config';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';
import {getApiUrl, getMarketUrl, getServerAppUrl, getXpVersion} from './api';

describe('utils/url/api', () => {
    beforeEach(() => {
        CONFIG.setConfig({
            serverAppApi: {
                install: 'https://example.com/admin/install',
                installUrl: 'https://example.com/admin/installUrl',
                start: 'https://example.com/admin/start',
                stop: 'https://example.com/admin/stop',
                uninstall: 'https://example.com/admin/uninstall',
            },
            marketApi: 'https://market.example.com/graphql',
            xpVersion: '7.15.3-SNAPSHOT',
        });
    });

    afterEach(() => {
        CONFIG.setConfig({});
    });

    describe('getApiUrl', () => {
        it('builds a URL under /admin/rest-v2/apps/', () => {
            expect(getApiUrl('application/list')).toBe('/admin/rest-v2/apps/application/list');
        });

        it('normalizes accidental leading slashes', () => {
            expect(getApiUrl('/application')).toBe('/admin/rest-v2/apps/application');
        });
    });

    describe('getServerAppUrl', () => {
        it.each([
            ['install', 'https://example.com/admin/install'],
            ['installUrl', 'https://example.com/admin/installUrl'],
            ['start', 'https://example.com/admin/start'],
            ['stop', 'https://example.com/admin/stop'],
            ['uninstall', 'https://example.com/admin/uninstall'],
        ] as const)('returns the CONFIG value for %s', (action, url) => {
            expect(getServerAppUrl(action)).toBe(url);
        });
    });

    describe('getMarketUrl', () => {
        it('returns the marketApi CONFIG value', () => {
            expect(getMarketUrl()).toBe('https://market.example.com/graphql');
        });
    });

    describe('getXpVersion', () => {
        it('strips any qualifier suffix', () => {
            expect(getXpVersion()).toBe('7.15.3');
        });
    });
});
