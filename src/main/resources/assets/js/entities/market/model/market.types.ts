export type MarketApplicationVersion = {
  version: string;
  downloadUrl: string;
  sha512?: string;
  versionDate?: string;
};

/**
 * An application Enonic Market offers for this XP, with what this instance has of it.
 *
 * `installedVersion`, `updateAvailable` and `installedAhead` are resolved server-side against the
 * installed applications, so no version comparison happens in the browser — see `docs/unified-api.md`.
 */
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
