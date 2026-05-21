import {beforeEach, describe, expect, it} from 'vitest';
import type {ApplicationDto} from '../types/application';
import type {MarketItemDto} from '../types/market';
import {resetAppActions, setInstalling} from './app-actions.store';
import {resetApplications, upsertApplication} from './applications.store';
import {
    $isMarketEmpty,
    $market,
    $marketAppStatuses,
    $visibleMarketItems,
    appendItems,
    compareVersionNumbers,
    getMarketAppStatus,
    resetMarket,
    resetMarketResults,
    setItems,
    setPagination,
    setQuery,
    setStatus,
} from './market.store';

function makeApp(overrides: Partial<ApplicationDto> & {key: string}): ApplicationDto {
    return {
        key: overrides.key,
        name: overrides.name ?? overrides.key,
        displayName: overrides.displayName ?? overrides.key,
        description: overrides.description ?? '',
        version: overrides.version ?? '1.0.0',
        state: overrides.state ?? 'started',
        url: overrides.url ?? '',
        iconUrl: overrides.iconUrl ?? '',
        vendorName: overrides.vendorName ?? '',
        vendorUrl: overrides.vendorUrl ?? '',
        local: overrides.local ?? false,
        system: overrides.system ?? false,
        minSystemVersion: overrides.minSystemVersion ?? '',
        maxSystemVersion: overrides.maxSystemVersion ?? '',
        modifiedTime: overrides.modifiedTime ?? '',
    };
}

function makeItem(overrides: Partial<MarketItemDto> & {key: string}): MarketItemDto {
    return {
        key: overrides.key,
        displayName: overrides.displayName ?? overrides.key,
        description: overrides.description ?? '',
        iconUrl: overrides.iconUrl ?? '',
        vendorName: overrides.vendorName ?? '',
        vendorUrl: overrides.vendorUrl ?? '',
        url: overrides.url ?? '',
        latestVersion: overrides.latestVersion ?? '1.0.0',
        downloadUrl: overrides.downloadUrl ?? '',
        sha512: overrides.sha512 ?? '',
        installed: overrides.installed ?? false,
    };
}

describe('market.store', () => {
    beforeEach(() => {
        resetMarket();
        resetApplications();
        resetAppActions();
    });

    describe('setQuery', () => {
        it('updates the query', () => {
            setQuery('search me');
            expect($market.get().query).toBe('search me');
        });
    });

    describe('setItems', () => {
        it('replaces the result set', () => {
            setItems([makeItem({key: 'a'})]);
            setItems([makeItem({key: 'b'})]);
            expect($market.get().items.map((i) => i.key)).toEqual(['b']);
        });
    });

    describe('appendItems', () => {
        it('appends to the result set', () => {
            setItems([makeItem({key: 'a'})]);
            appendItems([makeItem({key: 'b'})]);
            expect($market.get().items.map((i) => i.key)).toEqual(['a', 'b']);
        });

        it('no-ops on empty input', () => {
            setItems([makeItem({key: 'a'})]);
            appendItems([]);
            expect($market.get().items.map((i) => i.key)).toEqual(['a']);
        });
    });

    describe('setStatus', () => {
        it('sets the load status', () => {
            setStatus('loading');
            expect($market.get().status).toBe('loading');
        });
    });

    describe('setPagination', () => {
        it('updates hasMore and cursor together', () => {
            setPagination(true, 'cursor-1');
            const state = $market.get();
            expect(state.hasMore).toBe(true);
            expect(state.cursor).toBe('cursor-1');
        });
    });

    describe('resetMarketResults', () => {
        it('keeps the query but resets items, status and pagination', () => {
            setQuery('search me');
            setItems([makeItem({key: 'a'})]);
            setStatus('loaded');
            setPagination(true, 'cursor-1');

            resetMarketResults();

            const state = $market.get();
            expect(state.query).toBe('search me');
            expect(state.items).toEqual([]);
            expect(state.status).toBe('idle');
            expect(state.hasMore).toBe(false);
            expect(state.cursor).toBe('');
        });
    });

    describe('resetMarket', () => {
        it('resets every field including the query', () => {
            setQuery('search me');
            setItems([makeItem({key: 'a'})]);
            resetMarket();
            expect($market.get().query).toBe('');
            expect($market.get().items).toEqual([]);
        });
    });

    describe('$isMarketEmpty', () => {
        it('is false when status is not loaded', () => {
            setStatus('loading');
            expect($isMarketEmpty.get()).toBe(false);
        });

        it('is true when loaded and no items', () => {
            setStatus('loaded');
            expect($isMarketEmpty.get()).toBe(true);
        });

        it('is false when loaded with items', () => {
            setStatus('loaded');
            setItems([makeItem({key: 'a'})]);
            expect($isMarketEmpty.get()).toBe(false);
        });
    });

    describe('compareVersionNumbers', () => {
        it('returns positive when a is greater', () => {
            expect(compareVersionNumbers('1.2.0', '1.1.0')).toBeGreaterThan(0);
            expect(compareVersionNumbers('2.0.0', '1.99.99')).toBeGreaterThan(0);
        });

        it('returns negative when a is smaller', () => {
            expect(compareVersionNumbers('1.0.0', '1.0.1')).toBeLessThan(0);
        });

        it('returns 0 for equal versions', () => {
            expect(compareVersionNumbers('1.2.3', '1.2.3')).toBe(0);
        });

        it('treats longer as greater when prefix matches', () => {
            expect(compareVersionNumbers('1.0.0', '1.0')).toBeGreaterThan(0);
            expect(compareVersionNumbers('1.0', '1.0.0')).toBeLessThan(0);
        });
    });

    describe('getMarketAppStatus', () => {
        const item = makeItem({key: 'app1', latestVersion: '1.2.0'});

        it('is not_installed when no local version', () => {
            expect(getMarketAppStatus(item, {}, new Set())).toBe('not_installed');
        });

        it('is installed when local version matches latest', () => {
            expect(getMarketAppStatus(item, {app1: '1.2.0'}, new Set())).toBe('installed');
        });

        it('is older_version_installed when local version is older', () => {
            expect(getMarketAppStatus(item, {app1: '1.0.0'}, new Set())).toBe('older_version_installed');
        });

        it('is installed when local version is newer than market', () => {
            expect(getMarketAppStatus(item, {app1: '2.0.0'}, new Set())).toBe('installed');
        });

        it('is installing when the key is in the installing set', () => {
            expect(getMarketAppStatus(item, {}, new Set(['app1']))).toBe('installing');
        });

        it('installing wins over older_version_installed', () => {
            expect(getMarketAppStatus(item, {app1: '1.0.0'}, new Set(['app1']))).toBe('installing');
        });
    });

    describe('$marketAppStatuses', () => {
        it('produces a status per item against installed apps and in-flight installs', () => {
            setItems([
                makeItem({key: 'fresh', latestVersion: '1.0.0'}),
                makeItem({key: 'current', latestVersion: '1.0.0'}),
                makeItem({key: 'upgradable', latestVersion: '2.0.0'}),
                makeItem({key: 'pending', latestVersion: '1.0.0'}),
            ]);
            upsertApplication(makeApp({key: 'current', version: '1.0.0'}));
            upsertApplication(makeApp({key: 'upgradable', version: '1.0.0'}));
            setInstalling({key: 'pending', progress: 25});

            expect($marketAppStatuses.get()).toEqual({
                fresh: 'not_installed',
                current: 'installed',
                upgradable: 'older_version_installed',
                pending: 'installing',
            });
        });
    });

    describe('$visibleMarketItems', () => {
        it('filters items by query across name, description, vendor and key', () => {
            setItems([
                makeItem({key: 'com.foo.bar', displayName: 'Bar Tool', vendorName: 'Acme'}),
                makeItem({key: 'com.other', displayName: 'Other', vendorName: 'Globex'}),
                makeItem({key: 'com.foo.baz', displayName: 'Baz Tool', description: 'Uses bar internally', vendorName: 'Initech'}),
            ]);

            setQuery('bar');
            const keys = $visibleMarketItems.get().map((i) => i.key);
            expect(keys).toContain('com.foo.bar');
            expect(keys).toContain('com.foo.baz');
            expect(keys).not.toContain('com.other');
        });

        it('sorts upgradable items first then alphabetically', () => {
            setItems([
                makeItem({key: 'z', displayName: 'Zebra', latestVersion: '1.0.0'}),
                makeItem({key: 'a', displayName: 'Anchor', latestVersion: '1.0.0'}),
                makeItem({key: 'm', displayName: 'Mango', latestVersion: '2.0.0'}),
            ]);
            upsertApplication(makeApp({key: 'm', version: '1.0.0'}));

            const ordered = $visibleMarketItems.get().map((i) => i.key);
            expect(ordered).toEqual(['m', 'a', 'z']);
        });
    });
});
