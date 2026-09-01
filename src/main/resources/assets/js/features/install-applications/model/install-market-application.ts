import { installApplication } from '../../../entities/application';
import { marketLoadSettled } from '../../../entities/market';
import { beginInstall, endInstall, isInstalling } from './install.store';
import { canInstall, isMajorUpdate, type MarketRow } from './market-rows';

/** What a press of a row's button amounts to. */
export type MarketInstallIntent = 'ignore' | 'confirm' | 'install';

/**
 * Whether a press installs, asks first, or is not a press at all. ? It answers rather than acts because the
 * confirmation is a view of the install dialog: the row asked about is one that dialog already holds, so
 * nothing outside it has to keep that row anywhere.
 */
export function marketInstallIntent(row: MarketRow): MarketInstallIntent {
  if (!canInstall(row) || isInstalling(row.key)) {
    return 'ignore';
  }

  return isMajorUpdate(row) ? 'confirm' : 'install';
}

/**
 * Installs the row, leaving it installing until the catalogue caught up. ? It waits rather than reloads:
 * core publishes INSTALLED before it answers, so `market.service` has the reload out well before this
 * returns and asking for one here would be a second call to Enonic Market.
 */
export async function runMarketInstall(row: MarketRow): Promise<void> {
  beginInstall(row.key, row.downloadUrl);

  const result = await installApplication({
    displayName: row.displayName,
    url: row.downloadUrl,
    sha512: row.sha512,
    updating: row.status === 'update',
  });

  if (result.isOk()) {
    await marketLoadSettled();
  }

  endInstall(row.key);
}
