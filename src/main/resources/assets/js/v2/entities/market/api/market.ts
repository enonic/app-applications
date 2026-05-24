import {AppError} from '../../../shared/api/errors/AppError';
import {getMarketUrl, getXpVersion} from '../../../shared/lib/url/api';
import type {MarketItemDto} from '../types/Market';

const MARKET_TIMEOUT_MS = 30_000;
const MAX_QUERY_RESULTS = 1_000;

//
// * Types
//

interface MarketGraphQLResponse {
    data?: {
        market?: {
            queryDsl?: MarketApplicationGraphQLJson[];
        };
    };
    errors?: {
        errorType?: string;
        message: string;
    }[];
}

interface MarketApplicationGraphQLJson {
    _id?: string;
    _path?: string;
    displayName?: string;
    pageUrl?: string;
    type?: string;
    data?: {
        version?: VersionGraphQLJson[];
        icon?: {
            attachmentUrl?: string;
        };
        vendor?: string;
        shortDescription?: string;
        identifier?: string;
        artifactId?: string;
        groupId?: string;
        repository?: string;
    };
}

interface VersionGraphQLJson {
    versionNumber?: string;
    supportedVersions?: string | string[];
    sha512?: string;
    versionDate?: string;
    downloadUrl?: string;
}

//
// * Endpoint
//

/**
 * Fetches the Enonic Market catalog, keeping only versions compatible with the
 * given XP `version` (defaults to `CONFIG.xpVersion`). The optional `query`
 * argument is reserved for future server-side filtering and currently ignored.
 */
export async function listMarketApplications(query?: string, version?: string): Promise<MarketItemDto[]> {
    void query; // Reserved for future server-side search; filtering happens client-side today.

    const xpVersion = version ?? getXpVersion();
    const gql = buildGraphQLQuery(xpVersionPattern(xpVersion));

    const response = await fetch(getMarketUrl(), {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify({query: gql}),
        signal: AbortSignal.timeout(MARKET_TIMEOUT_MS),
        // Market is cross-origin; do not send credentials.
        credentials: 'omit',
    });

    if (!response.ok) {
        throw new AppError(`Failed to fetch from market (HTTP ${response.status})`, {
            status: response.status,
            operation: 'listMarketApplications',
        });
    }

    const json = (await response.json()) as MarketGraphQLResponse;

    if (json.errors && json.errors.length > 0) {
        throw new AppError(json.errors[0].message, {operation: 'listMarketApplications'});
    }

    return parseItems(json.data?.market?.queryDsl ?? [], xpVersion);
}

//
// * Parsing helpers
//

function parseItems(items: MarketApplicationGraphQLJson[], xpVersion: string): MarketItemDto[] {
    const result: MarketItemDto[] = [];
    for (const item of items) {
        const dto = toMarketItemDto(item, xpVersion);
        if (dto) result.push(dto);
    }
    return result;
}

function toMarketItemDto(item: MarketApplicationGraphQLJson, xpVersion: string): MarketItemDto | undefined {
    const data = item.data;
    if (!data) return undefined;

    const key = getAppKey(item);
    if (!key) return undefined;

    const supported = (data.version ?? []).filter((v) => isVersionSupported(v, xpVersion));
    if (supported.length === 0) return undefined;

    const latest = findLatestVersion(supported);
    const latestEntry = supported.find((v) => v.versionNumber === latest);

    return {
        key,
        displayName: item.displayName ?? '',
        description: data.shortDescription ?? '',
        iconUrl: data.icon?.attachmentUrl ?? '',
        vendorName: data.vendor ?? '',
        vendorUrl: '',
        url: item.pageUrl ?? '',
        latestVersion: latest,
        downloadUrl: latestEntry?.downloadUrl ?? '',
        sha512: latestEntry?.sha512 ?? '',
        installed: false,
    };
}

function getAppKey(item: MarketApplicationGraphQLJson): string | undefined {
    const data = item.data;
    if (!data) return undefined;
    if (data.identifier) return data.identifier;
    if (data.groupId && data.artifactId) return `${data.groupId}.${data.artifactId}`;
    return undefined;
}

function isVersionSupported(version: VersionGraphQLJson, xpVersion: string): boolean {
    if (!version.supportedVersions) return false;

    const supportedVersions = Array.isArray(version.supportedVersions)
        ? version.supportedVersions
        : [version.supportedVersions];

    return supportedVersions.some((s) => xpAtLeast(xpVersion, s));
}

/** True when `xpVersion >= supported`, comparing dotted numeric parts left-to-right. */
function xpAtLeast(xpVersion: string, supported: string): boolean {
    const xpParts = xpVersion.split('.').map(Number);
    const supportedParts = supported.split('.');

    for (let i = 0; i < supportedParts.length; i++) {
        const xpPart = xpParts[i] ?? 0;
        const supportedNum = Number(supportedParts[i]);
        if (xpPart > supportedNum) return true;
        if (xpPart < supportedNum) return false;
    }
    return true;
}

function findLatestVersion(versions: VersionGraphQLJson[]): string {
    let latest = '';
    for (const v of versions) {
        if (!v.versionNumber) continue;
        if (!latest || isVersionGreater(v.versionNumber, latest)) {
            latest = v.versionNumber;
        }
    }
    return latest;
}

function isVersionGreater(a: string, b: string): boolean {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    const len = Math.max(aParts.length, bParts.length);

    for (let i = 0; i < len; i++) {
        const ai = aParts[i] ?? 0;
        const bi = bParts[i] ?? 0;
        if (ai > bi) return true;
        if (ai < bi) return false;
    }
    return false;
}

function xpVersionPattern(xpVersion: string): string {
    return xpVersion.split('.')[0] + '.*';
}

function buildGraphQLQuery(supportedPattern: string): string {
    return `{
        market {
            queryDsl(
                query: {
                    boolean: {
                        must: [
                            {
                                term: {
                                    field: "type",
                                    value: {
                                        string: "com.enonic.app.market:application"
                                    }
                                }
                            },
                            {
                                like: {
                                    field: "data.version.supportedVersions",
                                    value: "${supportedPattern}"
                                }
                            }
                        ]
                    }
                },
                first: ${MAX_QUERY_RESULTS}
            ) {
                _id
                _path
                displayName
                ... on com_enonic_app_market_Application {
                    pageUrl
                    type
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
                        vendor
                        shortDescription
                        identifier
                        artifactId
                        groupId
                        repository
                    }
                }
            }
        }
    }`;
}
