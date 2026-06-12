import {CONFIG} from '@enonic/lib-admin-ui/util/Config';

const ADMIN_PATH = '/admin';
const REST_PATH = 'rest-v2/apps';

function joinPath(...parts: string[]): string {
    return parts.filter(Boolean).join('/').replace(/([^:])\/+/g, '$1/');
}

/** Build URL under `/admin/rest-v2/apps/...`. */
export function getApiUrl(path: string): string {
    return joinPath(ADMIN_PATH, REST_PATH, path);
}

export type ServerAppAction = 'install' | 'installUrl' | 'uninstall' | 'start' | 'stop';

/** Absolute portal URL from injected CONFIG (`serverAppApi.<action>`). */
export function getServerAppUrl(action: ServerAppAction): string {
    return CONFIG.getString(`serverAppApi.${action}`);
}

/** Absolute market GraphQL URL from injected CONFIG (`marketApi`). */
export function getMarketUrl(): string {
    return CONFIG.getString('marketApi');
}

/** Current XP version from `CONFIG.xpVersion` with any qualifier stripped (e.g. `7.15.0-SNAPSHOT` → `7.15.0`). */
export function getXpVersion(): string {
    return CONFIG.getString('xpVersion').replace(/-.*$/, '');
}
