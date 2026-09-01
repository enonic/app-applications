import { map } from 'nanostores';
import type { Result } from 'neverthrow';

import type { AppError } from '../../../shared/api';
import type { MarketApplication } from './market.types';

export type MarketApplicationsState = {
  status: 'loading' | 'ready' | 'error';
  items: readonly MarketApplication[];
  error?: string;
};

export const $marketApplications = map<MarketApplicationsState>({ status: 'loading', items: [] });

export function beginMarketLoad(): void {
  if ($marketApplications.get().items.length === 0) {
    $marketApplications.setKey('status', 'loading');
  }
}

export function receiveMarketApplications(result: Result<MarketApplication[], AppError>): void {
  result.match(
    (items) => $marketApplications.set({ status: 'ready', items }),
    (error) => $marketApplications.set({ status: 'error', items: [], error: error.message }),
  );
}

export function isMarketCached(): boolean {
  return $marketApplications.get().status === 'ready';
}
