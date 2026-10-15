import { createDialogStore } from '../../../shared/dialog';
import type { MarketRow } from './market-rows';

const store = createDialogStore<MarketRow>();

/** The row the major-version question is about, or nothing while it is closed. */
export const $updateConfirmTarget = store.$payload;

export function openUpdateConfirm(row: MarketRow): void {
  store.open(row);
}

export function closeUpdateConfirm(): void {
  store.close();
}
