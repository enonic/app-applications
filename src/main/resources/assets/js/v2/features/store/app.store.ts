import {computed, map} from 'nanostores';
import {syncMapStore} from '../utils/storage/sync';

//
// * Types
//

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export type AppPage = 'browse';

interface AppStore {
    theme: Theme;
    page: AppPage;
    readonly: boolean;
}

//
// * Store state
//

const SYNC_NAME = 'app';

export const $app = map<AppStore>({
    theme: getInitialTheme(),
    page: 'browse',
    readonly: false,
});

syncMapStore($app, SYNC_NAME, {
    keys: ['theme'],
    loadInitial: true,
    syncTabs: true,
});

//
// * Derived state
//

export const $isBrowse = computed($app, ({page}) => page === 'browse');

export const $isReadonly = computed($app, ({readonly}) => readonly);

//
// * Public API
//

/**
 * Sets the user-selected theme. `system` defers to the OS preference at apply time.
 */
export function setTheme(theme: Theme): void {
    $app.setKey('theme', theme);
}

/**
 * Cycles light → dark → system → light.
 */
export function cycleTheme(): void {
    const {theme} = $app.get();
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
    return resolveTheme($app.get().theme);
}

/** Toggles the global read-only mode (disables write actions across the UI). */
export function setReadonly(readonly: boolean): void {
    $app.setKey('readonly', readonly);
}

/** Sets the currently active page. */
export function setPage(page: AppPage): void {
    $app.setKey('page', page);
}

//
// * Utilities
//

function getSystemPreference(): ResolvedTheme {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme(): Theme {
    if (typeof window === 'undefined') return 'system';
    try {
        const saved = window.localStorage?.getItem('enonic:apps:app');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.theme === 'dark' || parsed.theme === 'light' || parsed.theme === 'system') {
                return parsed.theme;
            }
        }
    } catch {
        // Fall through to default
    }
    return 'system';
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

//
// * Internal subscriptions
//

$app.subscribe((state) => {
    applyTheme(state.theme);
});

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (): void => {
        const {theme} = $app.get();
        if (theme === 'system') {
            applyTheme('system');
        }
    };

    if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleSystemThemeChange);
    }
}
