import {MarketApplicationResponse} from './MarketApplicationResponse';
import {MarketApplication} from './MarketApplication';
import {MarketApplicationMetadata} from './MarketApplicationMetadata';
import Q from 'q';
import {MarketApplicationJson} from './json/MarketApplicationJson';
import {CONFIG} from '@enonic/lib-admin-ui/util/Config';

const REQUEST_TIMEOUT_MS = 30000;
const MAX_QUERY_RESULTS = 1000;

interface MarketGraphQLResponse {
    data?: {
        market: {
            queryDsl: MarketApplicationGraphQLJson[];
        };
    };
    errors?: {
        errorType: string;
        message: string;
    }[];
}

interface MarketApplicationGraphQLJson {
    _id: string;
    _path: string;
    displayName: string;
    pageUrl: string;
    type: string;
    data: {
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
    versionNumber: string;
    supportedVersions?: string | string[];
    sha512?: string;
    versionDate?: string;
    downloadUrl?: string;
}

export class ListMarketApplicationsRequest {
    private url: string;

    setUrl(url: string): ListMarketApplicationsRequest {
        this.url = url;
        return this;
    }

    private static getXpVersion(): string {
        return CONFIG.getString('xpVersion').replace(/-.*$/, '');
    }

    private static getXpVersionPattern(): string {
        return ListMarketApplicationsRequest.getXpVersion().split('.')[0] + '.*';
    }

    sendAndParse(): Q.Promise<MarketApplicationResponse> {
        const deferred = Q.defer<MarketApplicationResponse>();

        fetch(this.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            },
            body: JSON.stringify({query: this.getGraphQLQuery()}),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch from market. Status: ${response.status}`);
                }

                return response.json();
            })
            .then((responseJson: MarketGraphQLResponse) => {
                if (responseJson.errors && responseJson.errors.length > 0) {
                    throw new Error(responseJson.errors[0].message);
                }

                const result = this.parseResponse(responseJson);
                deferred.resolve(result);
            })
            .catch(error => {
                if (error.name === 'AbortError') {
                    deferred.reject(new Error('Request timed out'));
                } else {
                    deferred.reject(error);
                }
            });

        return deferred.promise;
    }

    private parseResponse(response: MarketGraphQLResponse): MarketApplicationResponse {
        const queryResults = response?.data?.market?.queryDsl || [];
        const applications: MarketApplication[] = [];

        for (const item of queryResults) {
            const appJson = this.convertToMarketApplicationJson(item);
            const appKey = ListMarketApplicationsRequest.getAppKey(item);
            if (appJson && appKey && appJson.latestVersion) {
                applications.push(MarketApplication.fromJson(appKey, appJson));
            }
        }

        const totalHits = applications.length;
        return new MarketApplicationResponse(applications, new MarketApplicationMetadata(totalHits, totalHits));
    }

    private static getAppKey(item: MarketApplicationGraphQLJson): string | null {
        if (item.data?.identifier) {
            return item.data.identifier;
        }
        if (item.data?.groupId && item.data?.artifactId) {
            return `${item.data.groupId}.${item.data.artifactId}`;
        }
        return null;
    }

    private convertToMarketApplicationJson(item: MarketApplicationGraphQLJson): MarketApplicationJson | null {
        if (!item.data) {
            return null;
        }

        // Filter versions to only include those that support the xpVersion
        const supportedVersions = (item.data.version || []).filter(ver => this.isVersionSupported(ver));

        const versions: Record<string, { applicationUrl: string }> = {};
        let latestVersion = '';

        if (supportedVersions.length > 0) {
            for (const ver of supportedVersions) {
                if (ver.versionNumber && ver.downloadUrl) {
                    versions[ver.versionNumber] = {
                        applicationUrl: ver.downloadUrl
                    };
                }
            }
            latestVersion = ListMarketApplicationsRequest.findLatestVersion(supportedVersions);
        }

        const appKey = ListMarketApplicationsRequest.getAppKey(item);

        return {
            displayName: item.displayName,
            name: appKey || '',
            description: item.data.shortDescription || '',
            iconUrl: item.data.icon?.attachmentUrl || '',
            url: item.pageUrl || '',
            latestVersion: latestVersion,
            versions: versions
        };
    }

    private isVersionSupported(version: VersionGraphQLJson): boolean {
        if (!version.supportedVersions) {
            return false;
        }

        const supportedVersions = Array.isArray(version.supportedVersions)
            ? version.supportedVersions
            : [version.supportedVersions];

        return supportedVersions.some(supported => this.matchesXpVersion(supported));
    }

    private matchesXpVersion(supportedVersion: string): boolean {
        // Checks if xpVersionFull >= supportedVersion
        // Examples (xpVersionFull = "7.15.0"):
        //   "7.0.0"  -> true  (7.15.0 >= 7.0.0)
        //   "7.15.0" -> true  (7.15.0 >= 7.15.0)
        //   "7.16.0" -> false (7.15.0 < 7.16.0)

        const xpParts = ListMarketApplicationsRequest.getXpVersion().split('.').map(Number);
        const supportedParts = supportedVersion.split('.');

        for (let i = 0; i < supportedParts.length; i++) {
            const supportedPart = supportedParts[i];
            const xpPart = xpParts[i] ?? 0;
            const supportedNum = Number(supportedPart);

            if (xpPart > supportedNum) {
                // xpVersion is higher, it's supported
                return true;
            } else if (xpPart < supportedNum) {
                // xpVersion is lower, not supported
                return false;
            }
            // Equal - continue to next part
        }

        // All parts are equal
        return true;
    }

    private static findLatestVersion(versions: VersionGraphQLJson[]): string {
        const validVersions = (versions || []).filter(v => v.versionNumber);

        if (validVersions.length === 0) {
            return '';
        }

        let latest = validVersions[0].versionNumber;

        for (const version of validVersions) {
            if (ListMarketApplicationsRequest.isVersionGreater(version.versionNumber, latest)) {
                latest = version.versionNumber;
            }
        }

        return latest;
    }

    private static isVersionGreater(newVersion: string, currentVersion: string): boolean {
        const v1Parts = newVersion.split('.').map(Number);
        const v2Parts = currentVersion.split('.').map(Number);
        const maxParts = Math.max(v1Parts.length, v2Parts.length);

        for (let i = 0; i < maxParts; i++) {
            const v1 = v1Parts[i] || 0;
            const v2 = v2Parts[i] || 0;

            if (v1 > v2) {
                return true;
            } else if (v1 < v2) {
                return false;
            }
        }

        return false;
    }

    private getGraphQLQuery(): string {
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
                                        value: "${ListMarketApplicationsRequest.getXpVersionPattern()}"
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
}
