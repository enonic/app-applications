import type { MarketApplication } from '../../../entities/market';
import { marketInstallIntent, runMarketInstall } from './install-market-application';
import { toMarketRow } from './market-rows';
import { openUpdateConfirm } from './update-dialog.store';

export function startMarketUpdate(application: MarketApplication): void {
  const row = toMarketRow(application);
  const intent = marketInstallIntent(row);

  if (intent === 'confirm') {
    openUpdateConfirm(row);
    return;
  }

  if (intent === 'install') {
    void runMarketInstall(row);
  }
}
