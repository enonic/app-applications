import {beforeEach, describe, expect, it} from 'vitest';
import type {ApplicationDto} from '../../types/Application';
import type {ApplicationInfoDto} from '../../types/ApplicationInfo';
import {
    $applications,
    removeApplications,
    resetApplications,
    setApplicationInfo,
    setApplications,
    setStatus,
    upsertApplication,
} from './index';

function makeApp(overrides: Partial<ApplicationDto> & {key: string}): ApplicationDto {
    return {
        key: overrides.key,
        name: overrides.name ?? overrides.key,
        displayName: overrides.displayName ?? overrides.key,
        description: overrides.description ?? '',
        version: overrides.version ?? '1.0.0',
        state: (overrides.state ?? 'started'),
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

function makeInfo(): ApplicationInfoDto {
    return {
        contentTypes: [],
        pages: [],
        parts: [],
        layouts: [],
        macros: [],
        tasks: [],
        tools: [],
        widgets: [],
        apis: [],
        idProviderApplication: undefined,
        deploymentUrl: '',
    };
}

describe('entities/application/store/applications', () => {
    beforeEach(() => {
        resetApplications();
    });

    describe('setApplications', () => {
        it('sorts items by displayName', () => {
            setApplications([
                makeApp({key: 'b', displayName: 'Banana'}),
                makeApp({key: 'a', displayName: 'Apple'}),
            ]);

            expect($applications.get().items.map((i) => i.key)).toEqual(['a', 'b']);
        });

        it('builds byKey index keyed by application key', () => {
            const apple = makeApp({key: 'a', displayName: 'Apple'});
            setApplications([apple]);
            expect($applications.get().byKey['a']).toEqual(apple);
        });
    });

    describe('upsertApplication', () => {
        it('appends new apps and keeps sort order', () => {
            setApplications([makeApp({key: 'a', displayName: 'Apple'})]);
            upsertApplication(makeApp({key: 'b', displayName: 'Banana'}));

            expect($applications.get().items.map((i) => i.key)).toEqual(['a', 'b']);
        });

        it('replaces existing app by key without losing other apps', () => {
            setApplications([makeApp({key: 'a', state: 'stopped'}), makeApp({key: 'b'})]);
            upsertApplication(makeApp({key: 'a', state: 'started'}));

            expect($applications.get().byKey['a'].state).toBe('started');
            expect($applications.get().items).toHaveLength(2);
        });
    });

    describe('removeApplications', () => {
        it('removes apps', () => {
            setApplications([makeApp({key: 'a'}), makeApp({key: 'b'})]);

            removeApplications(['a']);
            expect($applications.get().items.map((i) => i.key)).toEqual(['b']);
            expect($applications.get().byKey['a']).toBeUndefined();
        });

        it('no-ops on empty input', () => {
            setApplications([makeApp({key: 'a'})]);
            removeApplications([]);
            expect($applications.get().items).toHaveLength(1);
        });
    });

    describe('setStatus', () => {
        it('sets the load status', () => {
            setStatus('loading');
            expect($applications.get().status).toBe('loading');
        });
    });

    describe('setApplicationInfo', () => {
        it('caches info under the application key', () => {
            const info = makeInfo();
            setApplicationInfo('a', info);
            expect($applications.get().infoByKey['a']).toBe(info);
        });

        it('overwrites a previously cached entry', () => {
            const first = makeInfo();
            const second = {...makeInfo(), deploymentUrl: 'https://example.com/'};
            setApplicationInfo('a', first);
            setApplicationInfo('a', second);
            expect($applications.get().infoByKey['a']).toBe(second);
        });
    });

    describe('infoByKey pruning', () => {
        it('drops cached info for apps removed via removeApplications', () => {
            setApplications([makeApp({key: 'a'}), makeApp({key: 'b'})]);
            setApplicationInfo('a', makeInfo());
            setApplicationInfo('b', makeInfo());

            removeApplications(['a']);

            expect($applications.get().infoByKey['a']).toBeUndefined();
            expect($applications.get().infoByKey['b']).toBeDefined();
        });

        it('drops cached info for apps missing from a setApplications replace', () => {
            setApplications([makeApp({key: 'a'}), makeApp({key: 'b'})]);
            setApplicationInfo('a', makeInfo());
            setApplicationInfo('b', makeInfo());

            setApplications([makeApp({key: 'b'})]);

            expect($applications.get().infoByKey['a']).toBeUndefined();
            expect($applications.get().infoByKey['b']).toBeDefined();
        });
    });
});
