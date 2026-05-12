import {computed, map} from 'nanostores';
import type {MarketItemDto} from '../types/market';

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
