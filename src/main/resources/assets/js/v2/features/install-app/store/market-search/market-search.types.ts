import type {MarketItemDto} from '../../../../entities/market/types/Market';

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface MarketSearchState {
    query: string;
    items: MarketItemDto[];
    status: LoadStatus;
    hasMore: boolean;
    cursor: string;
}
