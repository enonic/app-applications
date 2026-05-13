import {computed, map} from 'nanostores';
import type {MarketAppStatus, MarketItemDto} from '../types/market';
import {$appActions} from './app-actions.store';
import {$applications} from './applications.store';

//
// * Types
//

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface MarketStore {
    query: string;
    items: MarketItemDto[];
    status: LoadStatus;
    hasMore: boolean;
    cursor: string;
}

//
// * Store state
//

export const $market = map<MarketStore>(initialState());

function initialState(): MarketStore {
    return {
        query: '',
        items: [],
        status: 'idle',
        hasMore: false,
        cursor: '',
    };
}

//
// * Mutators
//

/**
 * Sets the query string. Callers are expected to also reset the page when the
 * query changes (typically by calling `resetMarketResults` first).
 */
export function setQuery(query: string): void {
    $market.setKey('query', query);
}

/** Replaces the full result set (used when a new query starts). */
export function setItems(items: MarketItemDto[]): void {
    $market.setKey('items', items);
}

/** Appends to the result set (used when paginating). */
export function appendItems(items: MarketItemDto[]): void {
    if (items.length === 0) return;
    $market.setKey('items', [...$market.get().items, ...items]);
}

/** Sets the load status reported by the data layer. */
export function setStatus(status: LoadStatus): void {
    $market.setKey('status', status);
}

/** Updates pagination state in one atomic write. */
export function setPagination(hasMore: boolean, cursor: string): void {
    const current = $market.get();
    $market.set({...current, hasMore, cursor});
}

/** Resets results, status and pagination but keeps the current query. */
export function resetMarketResults(): void {
    const {query} = $market.get();
    $market.set({...initialState(), query});
}

/** Resets everything including the query. */
export function resetMarket(): void {
    $market.set(initialState());
}

//
// * Derived state
//

/** True when the latest fetch produced zero results (and we are no longer loading). */
export const $isMarketEmpty = computed($market, ({items, status}) => status === 'loaded' && items.length === 0);

/**
 * Per-key derived status of every market item against the currently installed
 * applications and any installs in progress. Recomputed automatically when any
 * input store changes; rows can derive their label from a single lookup.
 */
export const $marketAppStatuses = computed(
    [$market, $applications, $appActions],
    (market, applications, actions): Record<string, MarketAppStatus> => {
        const installedVersionByKey: Record<string, string> = {};
        for (const app of Object.values(applications.byKey)) {
            installedVersionByKey[app.key] = app.version;
        }
        const installingKeys = new Set(Object.keys(actions.installing));
        const result: Record<string, MarketAppStatus> = {};
        for (const item of market.items) {
            result[item.key] = getMarketAppStatus(item, installedVersionByKey, installingKeys);
        }
        return result;
    },
);

/**
 * Market items filtered by `$market.query` and sorted with apps that have a
 * newer version available first (legacy `compareAppsByStatusAndDisplayName`
 * behaviour), then alphabetically by display name.
 */
export const $visibleMarketItems = computed(
    [$market, $marketAppStatuses],
    (market, statuses): MarketItemDto[] => {
        const q = market.query.trim().toLowerCase();
        const filtered = q
            ? market.items.filter((item) => marketItemMatchesQuery(item, q))
            : market.items.slice();
        return filtered.sort((a, b) => compareByStatusAndDisplayName(a, b, statuses));
    },
);

//
// * Pure helpers
//

/**
 * Compares two dotted-numeric version strings.
 *
 * Ported verbatim from the legacy `MarketAppsTreeGridHelper.compareVersionNumbers`:
 * shorter inputs lose ties (`1.0` < `1.0.0`), non-numeric segments coerce via
 * `parseInt` (so `1.0.beta` reads as `1.0.NaN`, matching prior behaviour).
 * Returns `> 0` when `a > b`, `< 0` when `a < b`, `0` when equal.
 */
export function compareVersionNumbers(a: string, b: string): number {
    const aParts = a.split('.').map((el) => parseInt(el, 10));
    const bParts = b.split('.').map((el) => parseInt(el, 10));

    for (let i = 0; i < aParts.length; i++) {
        if (bParts.length === i) return 1;
        if (aParts[i] === bParts[i]) continue;
        if (aParts[i] > bParts[i]) return 1;
        return -1;
    }

    if (aParts.length !== bParts.length) return -1;
    return 0;
}

/**
 * Derives a single market item's status from the installed-version map and the
 * in-progress install set.
 */
export function getMarketAppStatus(
    item: MarketItemDto,
    installedVersionByKey: Record<string, string>,
    installingKeys: ReadonlySet<string>,
): MarketAppStatus {
    if (installingKeys.has(item.key)) return 'installing';
    const installedVersion = installedVersionByKey[item.key];
    if (installedVersion == null) return 'not_installed';
    if (item.latestVersion && compareVersionNumbers(item.latestVersion, installedVersion) > 0) {
        return 'older_version_installed';
    }
    return 'installed';
}

function marketItemMatchesQuery(item: MarketItemDto, query: string): boolean {
    return (
        item.displayName.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.vendorName.toLowerCase().includes(query) ||
        item.key.toLowerCase().includes(query)
    );
}

function compareByStatusAndDisplayName(
    a: MarketItemDto,
    b: MarketItemDto,
    statuses: Record<string, MarketAppStatus>,
): number {
    const sa = statuses[a.key];
    const sb = statuses[b.key];
    if (sa === sb) return a.displayName.localeCompare(b.displayName);
    if (sa === 'older_version_installed') return -1;
    if (sb === 'older_version_installed') return 1;
    return a.displayName.localeCompare(b.displayName);
}
