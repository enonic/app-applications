import {computed, map} from 'nanostores';
import {$applications} from '../../../../entities/application/store/applications';
import {$appActions} from '../../../../entities/application/store/operation-status';
import {compareVersionNumbers} from '../../../../entities/market/lib/compareVersionNumbers';
import type {MarketAppStatus, MarketItemDto} from '../../../../entities/market/types/Market';
import type {MarketSearchState} from './market-search.types';

function initialState(): MarketSearchState {
    return {
        query: '',
        items: [],
        status: 'idle',
        hasMore: false,
        cursor: '',
    };
}

export const $market = map<MarketSearchState>(initialState());

export {initialState as initialMarketSearchState};

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
