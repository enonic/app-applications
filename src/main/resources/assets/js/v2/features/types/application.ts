import {type Application} from '@enonic/lib-admin-ui/application/Application';
import {ApplicationKey} from '@enonic/lib-admin-ui/application/ApplicationKey';

/**
 * Flat JSON view of an application. Stored in nanostores so structural
 * equality, serialization, and cross-tab sync all work without class instances
 * leaking into state.
 */
export interface ApplicationDto {
    key: string;
    name: string;
    displayName: string;
    description: string;
    version: string;
    state: ApplicationState;
    url: string;
    iconUrl: string;
    vendorName: string;
    vendorUrl: string;
    local: boolean;
    system: boolean;
    minSystemVersion: string;
    maxSystemVersion: string;
}

export type ApplicationState = 'started' | 'stopped' | 'unknown';

const STATE_STARTED = 'started';
const STATE_STOPPED = 'stopped';

function toState(raw: string): ApplicationState {
    if (raw === STATE_STARTED) return 'started';
    if (raw === STATE_STOPPED) return 'stopped';
    return 'unknown';
}

/**
 * Converts a lib-admin-ui `Application` class instance into a flat `ApplicationDto`.
 * Always call this at the edges (e.g. on REST/WS response) before placing data in a store.
 */
export function toDto(app: Application): ApplicationDto {
    const key = app.getApplicationKey();
    return {
        key: key.toString(),
        name: key.getName(),
        displayName: app.getDisplayName() ?? '',
        description: app.getDescription() ?? '',
        version: app.getVersion() ?? '',
        state: toState(app.getState()),
        url: app.getUrl() ?? '',
        iconUrl: app.getIconUrl() ?? '',
        vendorName: app.getVendorName() ?? '',
        vendorUrl: app.getVendorUrl() ?? '',
        local: app.isLocal() === true,
        system: ApplicationKey.SYSTEM_RESERVED_APPLICATION_KEYS.some((k) => k.equals(key)),
        minSystemVersion: app.getMinSystemVersion() ?? '',
        maxSystemVersion: app.getMaxSystemVersion() ?? '',
    };
}

/** True if the app is in `started` state. */
export function isStarted(dto: ApplicationDto): boolean {
    return dto.state === 'started';
}

/** True if the app is in `stopped` state. */
export function isStopped(dto: ApplicationDto): boolean {
    return dto.state === 'stopped';
}
