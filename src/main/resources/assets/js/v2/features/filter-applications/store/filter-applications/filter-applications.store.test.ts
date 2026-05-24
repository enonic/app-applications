import {beforeEach, describe, expect, it} from 'vitest';
import {
    resetApplications,
    setApplications,
} from '../../../../entities/application/store/applications';
import type {ApplicationDto} from '../../../../entities/application/types/Application';
import {$filter, $visibleApps, resetFilter, setFilter, setHideSystem} from './index';

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

describe('features/filter-applications/store/filter-applications', () => {
    beforeEach(() => {
        resetApplications();
        resetFilter();
    });

    describe('setFilter', () => {
        it('updates the filter', () => {
            setFilter('hello');
            expect($filter.get().filter).toBe('hello');
        });
    });

    describe('setHideSystem', () => {
        it('toggles the hideSystem flag', () => {
            expect($filter.get().hideSystem).toBe(false);
            setHideSystem(true);
            expect($filter.get().hideSystem).toBe(true);
            setHideSystem(false);
            expect($filter.get().hideSystem).toBe(false);
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

        it('excludes system apps when hideSystem is on', () => {
            setApplications([
                makeApp({key: 'a', system: false}),
                makeApp({key: 'b', system: true}),
            ]);
            setHideSystem(true);
            expect($visibleApps.get().map((i) => i.key)).toEqual(['a']);
        });

        it('combines hideSystem with text filter', () => {
            setApplications([
                makeApp({key: 'a', displayName: 'Apple', system: false}),
                makeApp({key: 'b', displayName: 'Apricot', system: true}),
                makeApp({key: 'c', displayName: 'Banana', system: false}),
            ]);
            setHideSystem(true);
            setFilter('ap');
            expect($visibleApps.get().map((i) => i.key)).toEqual(['a']);
        });
    });
});
