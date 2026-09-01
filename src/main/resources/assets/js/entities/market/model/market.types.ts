export type MarketApplicationVersion = {
  version: string;
  downloadUrl: string;
  sha512?: string;
  versionDate?: string;
};

/** An application Enonic Market offers for this XP, with what this instance has of it. */
export type MarketApplication = {
  key: string;
  displayName: string;
  description?: string;
  iconUrl?: string;
  pageUrl?: string;
  latest: MarketApplicationVersion;
  installedVersion?: string;
  updateAvailable: boolean;
  installedAhead: boolean;
};
