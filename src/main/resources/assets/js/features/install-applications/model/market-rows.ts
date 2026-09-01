import type { MarketApplication } from '../../../entities/market';

/** What this instance can do with a market entry: install it, update it, or nothing. */
export type MarketRowStatus = 'install' | 'update' | 'installed' | 'ahead';

export type MarketRow = {
  key: string;
  displayName: string;
  description?: string;
  iconUrl?: string;
  pageUrl?: string;
  availableVersion: string;
  installedVersion?: string;
  downloadUrl: string;
  sha512?: string;
  status: MarketRowStatus;
};

export function toMarketRow(application: MarketApplication): MarketRow {
  return {
    key: application.key,
    displayName: application.displayName,
    description: application.description,
    iconUrl: application.iconUrl,
    pageUrl: application.pageUrl,
    availableVersion: application.latest.version,
    installedVersion: application.installedVersion,
    downloadUrl: application.latest.downloadUrl,
    sha512: application.latest.sha512,
    status: rowStatus(application),
  };
}

/**
 * Whether the row has a button at all: one on the latest version has nothing to do, and one ahead of the
 * market would be downgraded by the only thing on offer.
 */
export function canInstall({ status }: MarketRow): boolean {
  return status === 'install' || status === 'update';
}

/** Whether an update crosses a major version — the one case worth asking about, since behaviour may change. */
export function isMajorUpdate({ installedVersion, availableVersion }: MarketRow): boolean {
  if (installedVersion == null) {
    return false;
  }

  return majorOf(availableVersion) > majorOf(installedVersion);
}

/** Updates first, then by display name with the key breaking ties. */
export function sortMarketRows(rows: readonly MarketRow[]): MarketRow[] {
  return [...rows].sort((a, b) => {
    const byGroup = updateRank(a) - updateRank(b);
    if (byGroup !== 0) {
      return byGroup;
    }

    const byName = a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' });
    return byName !== 0 ? byName : a.key.localeCompare(b.key);
  });
}

/**
 * Display name and description, case-insensitive, over the loaded catalogue. ? The key is left out, unlike
 * the section's own search: an application is picked off the market by its advertised name.
 */
export function searchMarketRows(rows: readonly MarketRow[], query: string): MarketRow[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return [...rows];
  }

  return rows.filter(({ displayName, description }) =>
    [displayName, description].some((field) => field?.toLowerCase().includes(needle) ?? false),
  );
}

// *
// * Internal
// *

// ! `updateAvailable` and `installedAhead` are resolved server-side against the installed
// ! applications, so no version comparison belongs here.
function rowStatus(application: MarketApplication): MarketRowStatus {
  if (application.installedVersion == null) {
    return 'install';
  }
  if (application.updateAvailable) {
    return 'update';
  }

  return application.installedAhead ? 'ahead' : 'installed';
}

function updateRank({ status }: MarketRow): number {
  return status === 'update' ? 0 : 1;
}

function majorOf(version: string): number {
  return Number.parseInt(version.split('.')[0] ?? '', 10);
}
