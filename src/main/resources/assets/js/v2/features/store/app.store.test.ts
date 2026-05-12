import {beforeEach, describe, expect, it} from 'vitest';
import {
    $app,
    $isBrowse,
    $isReadonly,
    cycleTheme,
    getResolvedTheme,
    setPage,
    setReadonly,
    setTheme,
} from './app.store';

describe('app.store', () => {
    beforeEach(() => {
        $app.set({theme: 'system', page: 'browse', readonly: false});
    });

    describe('setTheme', () => {
        it('updates the theme key', () => {
            setTheme('dark');
            expect($app.get().theme).toBe('dark');
        });

        it('does not mutate other keys', () => {
            setTheme('light');
            expect($app.get().page).toBe('browse');
            expect($app.get().readonly).toBe(false);
        });
    });

    describe('cycleTheme', () => {
        it('cycles light → dark', () => {
            setTheme('light');
            cycleTheme();
            expect($app.get().theme).toBe('dark');
        });

        it('cycles dark → system', () => {
            setTheme('dark');
            cycleTheme();
            expect($app.get().theme).toBe('system');
        });

        it('cycles system → light', () => {
            setTheme('system');
            cycleTheme();
            expect($app.get().theme).toBe('light');
        });
    });

    describe('getResolvedTheme', () => {
        it('returns the explicit theme as-is', () => {
            setTheme('dark');
            expect(getResolvedTheme()).toBe('dark');
        });

        it('resolves system to light when no window is available (node test env)', () => {
            setTheme('system');
            expect(getResolvedTheme()).toBe('light');
        });
    });

    describe('setReadonly', () => {
        it('toggles the readonly flag', () => {
            setReadonly(true);
            expect($app.get().readonly).toBe(true);

            setReadonly(false);
            expect($app.get().readonly).toBe(false);
        });
    });

    describe('setPage', () => {
        it('sets the page', () => {
            setPage('browse');
            expect($app.get().page).toBe('browse');
        });
    });

    describe('$isBrowse', () => {
        it('is true when page is browse', () => {
            setPage('browse');
            expect($isBrowse.get()).toBe(true);
        });
    });

    describe('$isReadonly', () => {
        it('reflects the readonly flag', () => {
            setReadonly(true);
            expect($isReadonly.get()).toBe(true);

            setReadonly(false);
            expect($isReadonly.get()).toBe(false);
        });
    });
});
