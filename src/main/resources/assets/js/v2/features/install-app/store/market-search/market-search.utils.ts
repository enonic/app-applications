import type {MarketItemDto} from '../../../../entities/market/types/Market';
import {$market, initialMarketSearchState} from './market-search.store';
import type {LoadStatus} from './market-search.types';

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
    $market.set({...initialMarketSearchState(), query});
}

/** Resets everything including the query. */
export function resetMarket(): void {
    $market.set(initialMarketSearchState());
}
