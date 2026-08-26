import { request } from '/lib/http-client';
import { marketApiUrl, marketOrigin } from '/lib/market';
import { getVersion } from '/lib/xp/admin';
import { list } from '/lib/xp/app';

const MAX_APPLICATIONS = 1000;
const CONNECT_TIMEOUT_MS = 5_000;
const READ_TIMEOUT_MS = 10_000;

const MARKET_QUERY = `
  query MarketApplications($pattern: String!, $first: Int!) {
    market {
      queryDsl(
        query: {boolean: {must: [
          {term: {field: "type", value: {string: "com.enonic.app.market:application"}}}
          {like: {field: "data.version.supportedVersions", value: $pattern}}
        ]}}
        first: $first
      ) {
        displayName
        ... on com_enonic_app_market_Application {
          pageUrl
          data {
            version {
              versionNumber
              supportedVersions
              sha512
              versionDate
              downloadUrl
            }
            icon {
              attachmentUrl(type: absolute)
            }
            shortDescription
            identifier
            artifactId
            groupId
          }
        }
      }
    }
  }
`;

export type MarketApplicationVersion = {
  version: string;
  downloadUrl: string;
  sha512?: string;
  versionDate?: string;
};

export type MarketApplicationSource = {
  key: string;
  displayName: string;
  description?: string;
  iconUrl?: string;
  pageUrl?: string;
  latest: MarketApplicationVersion;
  versions: MarketApplicationVersion[];
  installedVersion?: string;
  updateAvailable: boolean;
  /**
   * ? Ahead of `latest`, which is the newest release this XP can run — a release declaring a minimum
   * ? above us never reaches the comparison — so it says "ahead of what is installable here", not
   * ? "ahead of the market". Nothing rests on the difference: the row reads as installed either way.
   */
  installedAhead: boolean;
};

export type MarketVersionDto = {
  versionNumber: string | null;
  supportedVersions: string | string[] | null;
  sha512: string | null;
  versionDate: string | null;
  downloadUrl: string | null;
};

export type MarketApplicationDto = {
  displayName: string | null;
  pageUrl: string | null;
  data: {
    version: MarketVersionDto | MarketVersionDto[] | null;
    icon: { attachmentUrl: string | null } | null;
    shortDescription: string | null;
    identifier: string | null;
    artifactId: string | null;
    groupId: string | null;
  } | null;
};

export type MarketContext = {
  xpVersion: string;
  installed: Record<string, string | undefined>;
  origin: string;
};

export function listMarketApplications(): MarketApplicationSource[] {
  const xpVersion = coreVersion(getVersion());
  const entries = fetchMarket(xpVersionPattern(xpVersion));

  return toMarketApplications(entries, {
    xpVersion,
    installed: installedVersions(),
    origin: marketOrigin(),
  });
}

// *
// * Version rules
// *

/**
 * Numeric part by part, a missing part reading as zero, and a prerelease losing to its release —
 * `1.0.0-SNAPSHOT` is older than `1.0.0`, `1.0` is the same version as `1.0.0`. A part that is not a
 * number reads as zero rather than poisoning the comparison with `NaN`, which compares false against
 * everything and would silently report two versions equal.
 */
export function compareVersions(a: string, b: string): number {
  const [aCore, aPrerelease] = splitVersion(a);
  const [bCore, bPrerelease] = splitVersion(b);

  const aParts = aCore.split('.');
  const bParts = bCore.split('.');

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const difference = toInt(aParts[i]) - toInt(bParts[i]);
    if (difference !== 0) {
      return difference > 0 ? 1 : -1;
    }
  }

  if (aPrerelease === bPrerelease) {
    return 0;
  }

  return aPrerelease ? -1 : 1;
}

/**
 * Whether a market version runs on this XP, read as "its declared minimum is not newer than we are".
 *
 * ? That is the pre-rewrite rule, kept deliberately. A market version declares one minimum XP
 * ? version, never a maximum, so nothing in the data says a 7-era release stopped working — which
 * ? means an application whose 7.x line is numbered above its 8.x line can present a 7-targeted jar
 * ? as its latest. Reading the minimum's major as a requirement would rule that out, and would also
 * ? hide a still-supported release that never re-declared itself. Neither reading is free; this one
 * ? matches what this app did before the rewrite.
 */
export function supportsXpVersion(
  supportedVersions: string | string[] | null,
  xpVersion: string,
): boolean {
  return toArray(supportedVersions).some((minimum) => compareVersions(minimum, xpVersion) <= 0);
}

/** `8.1.0-SNAPSHOT` → `8.1.0`: the market declares releases, never our build suffix. */
export function coreVersion(version: string): string {
  return version.replace(/-.*$/, '');
}

/** `8.1.0` → `8.*`, the app-level filter the market query takes. */
export function xpVersionPattern(xpVersion: string): string {
  return `${xpVersion.split('.')[0] ?? ''}.*`;
}

// *
// * Mapping
// *

/**
 * Wire entries to what the schema serves. Both narrowings drop the row rather than serving half of
 * one: an entry the market gives no usable key, and an application with no version this XP can run.
 */
export function toMarketApplications(
  entries: readonly MarketApplicationDto[],
  { xpVersion, installed, origin }: MarketContext,
): MarketApplicationSource[] {
  const applications: MarketApplicationSource[] = [];

  for (const entry of entries) {
    const key = keyOf(entry);
    if (key === undefined) {
      continue;
    }

    const versions = supportedVersionsOf(entry, xpVersion);
    const latest = versions[0];
    if (latest === undefined) {
      continue;
    }

    const installedVersion = installed[key];
    const marketAgainstInstalled =
      installedVersion === undefined
        ? undefined
        : compareVersions(latest.version, installedVersion);

    applications.push({
      key,
      displayName: entry.displayName ?? key,
      description: entry.data?.shortDescription ?? undefined,
      iconUrl: absoluteUrl(entry.data?.icon?.attachmentUrl, origin),
      pageUrl: absoluteUrl(entry.pageUrl, origin),
      latest,
      versions,
      installedVersion,
      updateAvailable: marketAgainstInstalled !== undefined && marketAgainstInstalled > 0,
      installedAhead: marketAgainstInstalled !== undefined && marketAgainstInstalled < 0,
    });
  }

  return applications.sort((a, b) =>
    a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' }),
  );
}

/** The application key: what the market publishes, else the coordinates it was built from. */
export function keyOf(entry: MarketApplicationDto): string | undefined {
  const { identifier, groupId, artifactId } = entry.data ?? {};
  if (identifier != null && identifier.length > 0) {
    return identifier;
  }

  return groupId != null && artifactId != null ? `${groupId}.${artifactId}` : undefined;
}

/** Market answers `pageUrl` relative and its icons absolute, so both go through here. */
export function absoluteUrl(url: string | null | undefined, origin: string): string | undefined {
  if (url == null || url.length === 0) {
    return undefined;
  }
  if (/^https?:\/\//.test(url)) {
    return url;
  }

  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

// *
// * Helpers
// *

/**
 * ! Sorted here, newest first, because the market returns versions in no order at all — Data Toolbox
 * ! lists 3.0.0 between two 2.2.x entries. Nothing downstream may take position for order.
 */
function supportedVersionsOf(
  entry: MarketApplicationDto,
  xpVersion: string,
): MarketApplicationVersion[] {
  const versions: MarketApplicationVersion[] = [];

  for (const { versionNumber, downloadUrl, supportedVersions, sha512, versionDate } of toArray(
    entry.data?.version,
  )) {
    if (
      versionNumber == null ||
      downloadUrl == null ||
      !supportsXpVersion(supportedVersions, xpVersion)
    ) {
      continue;
    }

    versions.push({
      version: versionNumber,
      downloadUrl,
      // Absent on every pre-8 release the market carries; `installUrl` verifies it where it exists.
      sha512: sha512 ?? undefined,
      versionDate: versionDate ?? undefined,
    });
  }

  return versions.sort((a, b) => compareVersions(b.version, a.version));
}

function installedVersions(): Record<string, string | undefined> {
  const versions: Record<string, string | undefined> = {};
  for (const application of list()) {
    // A version-less installation cannot be compared against, so it reads as not installed rather
    // than as installed at an unknown version.
    versions[application.key] = application.version ?? undefined;
  }

  return versions;
}

/**
 * ! Throws rather than answering an empty list: a market that is unreachable is not a market with
 * ! nothing in it, and the root field is nullable so the failure stays in its own field with the
 * ! message attached.
 */
function fetchMarket(pattern: string): MarketApplicationDto[] {
  const response = request({
    url: marketApiUrl(),
    method: 'POST',
    contentType: 'application/json',
    connectionTimeout: CONNECT_TIMEOUT_MS,
    readTimeout: READ_TIMEOUT_MS,
    body: JSON.stringify({
      query: MARKET_QUERY,
      variables: { pattern, first: MAX_APPLICATIONS },
    }),
  });

  if (response.status !== 200) {
    throw new Error(`Enonic Market answered ${String(response.status)} ${response.message}`);
  }

  const body = parseBody(response.body);
  const firstError = body.errors?.[0];
  if (firstError !== undefined) {
    throw new Error(`Enonic Market reported: ${firstError.message}`);
  }

  return body.data?.market?.queryDsl ?? [];
}

type MarketResponse = {
  data?: { market?: { queryDsl?: MarketApplicationDto[] | null } | null } | null;
  errors?: { message: string }[];
};

function parseBody(body: string | null): MarketResponse {
  if (body == null || body.length === 0) {
    throw new Error('Enonic Market answered with an empty body');
  }

  return JSON.parse(body) as MarketResponse;
}

function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function splitVersion(version: string): [core: string, prerelease: boolean] {
  const [core] = version.split('-', 1);
  return [core ?? version, core !== version];
}

function toInt(part: string | undefined): number {
  const parsed = Number.parseInt(part ?? '0', 10);
  return Number.isFinite(parsed) ? parsed : 0;
}
