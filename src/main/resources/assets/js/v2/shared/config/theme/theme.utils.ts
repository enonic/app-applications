import {$theme} from './theme.store';
import type {ResolvedTheme, Theme} from './theme.types';

function getSystemPreference(): ResolvedTheme {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(theme: Theme): ResolvedTheme {
    if (theme === 'system') {
        return getSystemPreference();
    }
    return theme;
}

function applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;

    const resolvedTheme = resolveTheme(theme);
    const isDark = resolvedTheme === 'dark';

    document.documentElement.classList.toggle('dark', isDark);

    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (colorSchemeMeta) {
        colorSchemeMeta.setAttribute('content', isDark ? 'dark' : 'light');
    }
}

/**
 * Sets the user-selected theme. `system` defers to the OS preference at apply time.
 */
export function setTheme(theme: Theme): void {
    $theme.set(theme);
}

/**
 * Cycles light → dark → system → light.
 */
export function cycleTheme(): void {
    const theme = $theme.get();
    switch (theme) {
        case 'light':
            setTheme('dark');
            break;
        case 'dark':
            setTheme('system');
            break;
        case 'system':
            setTheme('light');
            break;
    }
}

/** Returns the actual theme that should be rendered (`system` resolved to OS preference). */
export function getResolvedTheme(): ResolvedTheme {
    return resolveTheme($theme.get());
}

$theme.subscribe((theme) => {
    applyTheme(theme);
});

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (): void => {
        if ($theme.get() === 'system') {
            applyTheme('system');
        }
    };

    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleSystemThemeChange);
    }
}
