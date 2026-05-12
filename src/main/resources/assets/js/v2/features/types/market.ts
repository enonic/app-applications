/**
 * Flat JSON view of a single application listing returned from the Enonic Market.
 * Like `ApplicationDto`, kept as a plain object so it round-trips through stores
 * and storage without class instances.
 */
export interface MarketItemDto {
    /** Application key (e.g. `com.enonic.app.contentstudio`). */
    key: string;
    displayName: string;
    description: string;
    iconUrl: string;
    vendorName: string;
    vendorUrl: string;
    url: string;
    /** Latest version compatible with the current XP. May be empty if none matches. */
    latestVersion: string;
    /** Download URL of the latest compatible version. May be empty. */
    downloadUrl: string;
    /** SHA-512 digest of the latest compatible version. May be empty. */
    sha512: string;
    /** True when the app is already installed locally. */
    installed: boolean;
}
