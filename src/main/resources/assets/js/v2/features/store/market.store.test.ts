import {beforeEach, describe, expect, it} from 'vitest';
import type {MarketItemDto} from '../types/market';
import {
    $isMarketEmpty,
    $market,
    appendItems,
    resetMarket,
    resetMarketResults,
    setItems,
    setPagination,
    setQuery,
    setStatus,
} from './market.store';

function makeItem(overrides: Partial<MarketItemDto> & {key: string}): MarketItemDto {
    return {
        key: overrides.key,
        displayName: overrides.displayName ?? overrides.key,
        description: overrides.description ?? '',
        iconUrl: overrides.iconUrl ?? '',
        vendorName: overrides.vendorName ?? '',
        vendorUrl: overrides.vendorUrl ?? '',
        url: overrides.url ?? '',
        latestVersion: overrides.latestVersion ?? '1.0.0',
        downloadUrl: overrides.downloadUrl ?? '',
        sha512: overrides.sha512 ?? '',
        installed: overrides.installed ?? false,
    };
}

describe('market.store', () => {
    beforeEach(() => {
        resetMarket();
    });

    describe('setQuery', () => {
        it('updates the query', () => {
            setQuery('search me');
            expect($market.get().query).toBe('search me');
        });
    });

    describe('setItems', () => {
        it('replaces the result set', () => {
            setItems([makeItem({key: 'a'})]);
            setItems([makeItem({key: 'b'})]);
            expect($market.get().items.map((i) => i.key)).toEqual(['b']);
        });
    });

    describe('appendItems', () => {
        it('appends to the result set', () => {
            setItems([makeItem({key: 'a'})]);
            appendItems([makeItem({key: 'b'})]);
            expect($market.get().items.map((i) => i.key)).toEqual(['a', 'b']);
        });

        it('no-ops on empty input', () => {
            setItems([makeItem({key: 'a'})]);
            appendItems([]);
            expect($market.get().items.map((i) => i.key)).toEqual(['a']);
        });
    });

    describe('setStatus', () => {
        it('sets the load status', () => {
            setStatus('loading');
            expect($market.get().status).toBe('loading');
        });
    });

    describe('setPagination', () => {
        it('updates hasMore and cursor together', () => {
            setPagination(true, 'cursor-1');
            const state = $market.get();
            expect(state.hasMore).toBe(true);
            expect(state.cursor).toBe('cursor-1');
        });
    });

    describe('resetMarketResults', () => {
        it('keeps the query but resets items, status and pagination', () => {
            setQuery('search me');
            setItems([makeItem({key: 'a'})]);
            setStatus('loaded');
            setPagination(true, 'cursor-1');

            resetMarketResults();

            const state = $market.get();
            expect(state.query).toBe('search me');
            expect(state.items).toEqual([]);
            expect(state.status).toBe('idle');
            expect(state.hasMore).toBe(false);
            expect(state.cursor).toBe('');
        });
    });

    describe('resetMarket', () => {
        it('resets every field including the query', () => {
            setQuery('search me');
            setItems([makeItem({key: 'a'})]);
            resetMarket();
            expect($market.get().query).toBe('');
            expect($market.get().items).toEqual([]);
        });
    });

    describe('$isMarketEmpty', () => {
        it('is false when status is not loaded', () => {
            setStatus('loading');
            expect($isMarketEmpty.get()).toBe(false);
        });

        it('is true when loaded and no items', () => {
            setStatus('loaded');
            expect($isMarketEmpty.get()).toBe(true);
        });

        it('is false when loaded with items', () => {
            setStatus('loaded');
            setItems([makeItem({key: 'a'})]);
            expect($isMarketEmpty.get()).toBe(false);
        });
    });
});
