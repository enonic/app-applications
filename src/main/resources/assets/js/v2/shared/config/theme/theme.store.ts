import {atom} from 'nanostores';
import {syncAtomStore} from '../../lib/storage/sync';
import type {Theme} from './theme.types';

const SYNC_NAME = 'theme';

function getInitialTheme(): Theme {
    if (typeof window === 'undefined') return 'system';
    try {
        const saved = window.localStorage?.getItem('enonic:apps:theme');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed === 'dark' || parsed === 'light' || parsed === 'system') {
                return parsed;
            }
        }
    } catch {
        // Fall through to default
    }
    return 'system';
}

export const $theme = atom<Theme>(getInitialTheme());

syncAtomStore($theme, SYNC_NAME, {
    loadInitial: true,
    syncTabs: true,
});
