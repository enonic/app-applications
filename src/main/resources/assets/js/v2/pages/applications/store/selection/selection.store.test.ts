import {beforeEach, describe, expect, it} from 'vitest';
import {
    removeApplications,
    resetApplications,
    setApplications,
} from '../../../../entities/application/store/applications';
import type {ApplicationDto} from '../../../../entities/application/types/Application';
import {
    $selection,
    $selectionInfo,
    clearSelection,
    setSelection,
} from './index';

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

describe('pages/applications/store/selection', () => {
    beforeEach(() => {
        resetApplications();
        $selection.set([]);
    });

    describe('setSelection', () => {
        it('keeps known keys only', () => {
            setApplications([makeApp({key: 'a'}), makeApp({key: 'b'})]);
            setSelection(['a', 'unknown']);
            expect($selection.get()).toEqual(['a']);
        });
    });

    describe('clearSelection', () => {
        it('empties the selection', () => {
            setApplications([makeApp({key: 'a'})]);
            setSelection(['a']);
            clearSelection();
            expect($selection.get()).toEqual([]);
        });
    });

    describe('selection pruning', () => {
        it('drops keys for apps no longer present', () => {
            setApplications([makeApp({key: 'a'}), makeApp({key: 'b'})]);
            setSelection(['a', 'b']);

            removeApplications(['a']);
            expect($selection.get()).toEqual(['b']);
        });

        it('drops keys when setApplications replaces the list', () => {
            setApplications([makeApp({key: 'a'}), makeApp({key: 'b'})]);
            setSelection(['a', 'b']);

            setApplications([makeApp({key: 'a'})]);
            expect($selection.get()).toEqual(['a']);
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
