import {beforeEach, describe, expect, it} from 'vitest';
import {$theme, cycleTheme, getResolvedTheme, setTheme} from './index';

describe('shared/config/theme', () => {
    beforeEach(() => {
        $theme.set('system');
    });

    describe('setTheme', () => {
        it('updates the theme', () => {
            setTheme('dark');
            expect($theme.get()).toBe('dark');
        });
    });

    describe('cycleTheme', () => {
        it('cycles light → dark', () => {
            setTheme('light');
            cycleTheme();
            expect($theme.get()).toBe('dark');
        });

        it('cycles dark → system', () => {
            setTheme('dark');
            cycleTheme();
            expect($theme.get()).toBe('system');
        });

        it('cycles system → light', () => {
            setTheme('system');
            cycleTheme();
            expect($theme.get()).toBe('light');
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
});
