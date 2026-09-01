import type { ResultAsync } from 'neverthrow';

import { type AppError, type GraphQlRoot, requestGraphQl } from '../../../shared/api';
import type { MarketApplication, MarketApplicationVersion } from '../model/market.types';

const MARKET_APPLICATIONS_SELECTION = `{
  key
  displayName
  description
  iconUrl
  pageUrl
  latest {
    version
    downloadUrl
    sha512
    versionDate
  }
  installedVersion
  updateAvailable
  installedAhead
}`;

export const MARKET_APPLICATIONS_ROOT: GraphQlRoot = {
  field: 'marketApplications',
  selection: MARKET_APPLICATIONS_SELECTION,
};

type MarketApplicationVersionDto = {
  version: string;
  downloadUrl: string;
  sha512: string | null;
  versionDate: string | null;
};

type MarketApplicationDto = {
  key: string;
  displayName: string;
  description: string | null;
  iconUrl: string | null;
  pageUrl: string | null;
  latest: MarketApplicationVersionDto;
  installedVersion: string | null;
  updateAvailable: boolean;
  installedAhead: boolean;
};

type MarketApplicationsResult = { marketApplications: MarketApplicationDto[] };

/**
 * ! The one read in this app that leaves the XP instance: the resolver behind it calls Enonic Market.
 * ! It is therefore never batched into a section's screen document — one request is in flight at a
 * ! time, and a slow market would hold up the data a screen actually renders.
 */
export function fetchMarketApplications(
  signal?: AbortSignal,
): ResultAsync<MarketApplication[], AppError> {
  return requestGraphQl<MarketApplicationsResult>(MARKET_APPLICATIONS_ROOT, { signal }).map(
    ({ marketApplications }) => marketApplications.map(toMarketApplication),
  );
}

// *
// * Internal
// *

function toMarketApplication(dto: MarketApplicationDto): MarketApplication {
  return {
    key: dto.key,
    displayName: dto.displayName,
    description: dto.description ?? undefined,
    iconUrl: dto.iconUrl ?? undefined,
    pageUrl: dto.pageUrl ?? undefined,
    latest: toVersion(dto.latest),
    installedVersion: dto.installedVersion ?? undefined,
    updateAvailable: dto.updateAvailable,
    installedAhead: dto.installedAhead,
  };
}

function toVersion(dto: MarketApplicationVersionDto): MarketApplicationVersion {
  return {
    version: dto.version,
    downloadUrl: dto.downloadUrl,
    sha512: dto.sha512 ?? undefined,
    versionDate: dto.versionDate ?? undefined,
  };
}
