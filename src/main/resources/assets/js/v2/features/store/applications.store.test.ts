import {beforeEach, describe, expect, it} from 'vitest';
import type {ApplicationDto, ApplicationState} from '../types/application';
import {
    $applications,
    $selectionInfo,
    $visibleApps,
    clearSelection,
    removeApplications,
    resetApplications,
    setApplications,
    setFilter,
    setSelection,
    setStatus,
    upsertApplication,
} from './applications.store';

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
    };
}

describe('applications.store', () => {
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

        it('drops orphan selections that no longer exist', () => {
            setApplications([makeApp({key: 'a'}), makeApp({key: 'b'})]);
            setSelection(['a', 'b']);

            setApplications([makeApp({key: 'a'})]);
            expect($applications.get().selection).toEqual(['a']);
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
        it('removes apps and prunes orphan selection', () => {
            setApplications([makeApp({key: 'a'}), makeApp({key: 'b'})]);
            setSelection(['a', 'b']);

            removeApplications(['a']);
            expect($applications.get().items.map((i) => i.key)).toEqual(['b']);
            expect($applications.get().selection).toEqual(['b']);
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

    describe('setFilter', () => {
        it('updates the filter', () => {
            setFilter('hello');
            expect($applications.get().filter).toBe('hello');
        });
    });

    describe('setSelection', () => {
        it('keeps known keys only', () => {
            setApplications([makeApp({key: 'a'}), makeApp({key: 'b'})]);
            setSelection(['a', 'unknown']);
            expect($applications.get().selection).toEqual(['a']);
        });
    });

    describe('clearSelection', () => {
        it('empties the selection', () => {
            setApplications([makeApp({key: 'a'})]);
            setSelection(['a']);
            clearSelection();
            expect($applications.get().selection).toEqual([]);
        });
    });

    describe('$visibleApps', () => {
        it('returns all items when filter is empty', () => {
            setApplications([makeApp({key: 'a'}), makeApp({key: 'b'})]);
            expect($visibleApps.get().map((i) => i.key)).toEqual(['a', 'b']);
        });

        it('matches by displayName case-insensitively', () => {
            setApplications([
                makeApp({key: 'a', displayName: 'Apple'}),
                makeApp({key: 'b', displayName: 'Banana'}),
            ]);
            setFilter('app');
            expect($visibleApps.get().map((i) => i.key)).toEqual(['a']);
        });

        it('matches by vendorName', () => {
            setApplications([
                makeApp({key: 'a', vendorName: 'Enonic'}),
                makeApp({key: 'b', vendorName: 'Other'}),
            ]);
            setFilter('enonic');
            expect($visibleApps.get().map((i) => i.key)).toEqual(['a']);
        });

        it('matches by description', () => {
            setApplications([
                makeApp({key: 'a', description: 'Tool for X'}),
                makeApp({key: 'b', description: 'Tool for Y'}),
            ]);
            setFilter('for x');
            expect($visibleApps.get().map((i) => i.key)).toEqual(['a']);
        });

        it('matches by application name (key)', () => {
            setApplications([makeApp({key: 'com.enonic.app.foo'}), makeApp({key: 'com.enonic.app.bar'})]);
            setFilter('foo');
            expect($visibleApps.get().map((i) => i.key)).toEqual(['com.enonic.app.foo']);
        });
    });

    describe('$selectionInfo', () => {
        it('returns zeroes when selection is empty', () => {
            setApplications([makeApp({key: 'a'})]);
            expect($selectionInfo.get()).toEqual({
                count: 0,
                canStart: false,
                canStop: false,
                canUninstall: false,
                anySystem: false,
            });
        });

        it('canStop=true when every selected app is started, canStart=false', () => {
            setApplications([
                makeApp({key: 'a', state: 'started'}),
                makeApp({key: 'b', state: 'started'}),
            ]);
            setSelection(['a', 'b']);
            const info = $selectionInfo.get();
            expect(info.count).toBe(2);
            expect(info.canStop).toBe(true);
            expect(info.canStart).toBe(false);
        });

        it('canStart=true when every selected app is stopped, canStop=false', () => {
            setApplications([makeApp({key: 'a', state: 'stopped'})]);
            setSelection(['a']);
            const info = $selectionInfo.get();
            expect(info.canStart).toBe(true);
            expect(info.canStop).toBe(false);
        });

        it('canStart=false and canStop=false on mixed states', () => {
            setApplications([
                makeApp({key: 'a', state: 'started'}),
                makeApp({key: 'b', state: 'stopped'}),
            ]);
            setSelection(['a', 'b']);
            const info = $selectionInfo.get();
            expect(info.canStart).toBe(false);
            expect(info.canStop).toBe(false);
        });

        it('canUninstall=false when any selected app is a system app', () => {
            setApplications([
                makeApp({key: 'a', system: false}),
                makeApp({key: 'b', system: true}),
            ]);
            setSelection(['a', 'b']);
            const info = $selectionInfo.get();
            expect(info.anySystem).toBe(true);
            expect(info.canUninstall).toBe(false);
        });

        it('canUninstall=true when no selected app is a system app', () => {
            setApplications([makeApp({key: 'a', system: false}), makeApp({key: 'b', system: false})]);
            setSelection(['a', 'b']);
            expect($selectionInfo.get().canUninstall).toBe(true);
        });
    });
});
