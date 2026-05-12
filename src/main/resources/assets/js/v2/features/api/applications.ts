import type {ApplicationJson} from '@enonic/lib-admin-ui/application/json/ApplicationJson';
import {ApplicationKey} from '@enonic/lib-admin-ui/application/ApplicationKey';
import type {ApplicationInfoJson} from '../../../app/resource/json/ApplicationInfoJson';
import {type ApplicationDto, type ApplicationState} from '../types/application';
import {getApiUrl, getServerAppUrl, type ServerAppAction} from '../utils/url/api';
import {fromResponse} from './errors/AppError';

const DEFAULT_TIMEOUT_MS = 10_000;

//
// * Types
//

/** Server payload for application listing/get endpoints — extends lib-admin-ui's
 *  `ApplicationJson` with the `title`/`system` fields injected by the admin REST
 *  module. */
export interface ApplicationJsonExt extends ApplicationJson {
    title?: string;
    system?: boolean;
}

interface ListApplicationsResponseJson {
    applications: ApplicationJsonExt[];
}

//
// * GET endpoints
//

/** Lists all installed applications, optionally filtered server-side by free-text `query`. */
export async function listApplications(query?: string): Promise<ApplicationDto[]> {
    const url = getApiUrl('application/list') + (query ? `?query=${encodeURIComponent(query)}` : '');

    const response = await fetch(url, {
        headers: {Accept: 'application/json'},
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });

    if (!response.ok) await fromResponse(response, 'listApplications');

    const json = (await response.json()) as ListApplicationsResponseJson;
    return (json.applications ?? []).map(toDto);
}

/**
 * Gets a single application by key. Heavy operation — no timeout, since the server
 * may need to resolve descriptors lazily.
 */
export async function getApplication(key: string): Promise<ApplicationDto> {
    const url = getApiUrl('application') + `?applicationKey=${encodeURIComponent(key)}`;

    const response = await fetch(url, {
        headers: {Accept: 'application/json'},
    });

    if (!response.ok) await fromResponse(response, 'getApplication');

    const json = (await response.json()) as ApplicationJsonExt;
    return toDto(json);
}

/** Gets extended information (descriptors, deployment, references…) for a single application. */
export async function getApplicationInfo(key: string): Promise<ApplicationInfoJson> {
    const url = getApiUrl('application/info') + `?applicationKey=${encodeURIComponent(key)}`;

    const response = await fetch(url, {
        headers: {Accept: 'application/json'},
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });

    if (!response.ok) await fromResponse(response, 'getApplicationInfo');

    return (await response.json()) as ApplicationInfoJson;
}

//
// * POST action endpoints
//

/** Starts the given applications. */
export async function startApplications(keys: string[]): Promise<void> {
    await postAction('start', keys, 'startApplications');
}

/** Stops the given applications. */
export async function stopApplications(keys: string[]): Promise<void> {
    await postAction('stop', keys, 'stopApplications');
}

/** Uninstalls the given applications. */
export async function uninstallApplications(keys: string[]): Promise<void> {
    await postAction('uninstall', keys, 'uninstallApplications');
}

async function postAction(action: ServerAppAction, keys: string[], operation: string): Promise<void> {
    if (keys.length === 0) return;

    const response = await fetch(getServerAppUrl(action), {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify({key: keys}),
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });

    if (!response.ok) await fromResponse(response, operation);
}

//
// * Internal mapping
//

const STATE_STARTED = 'started';
const STATE_STOPPED = 'stopped';

function toState(raw: string | undefined): ApplicationState {
    if (raw === STATE_STARTED) return 'started';
    if (raw === STATE_STOPPED) return 'stopped';
    return 'unknown';
}

function isSystemApp(key: string, flag: boolean | undefined): boolean {
    if (flag === true) return true;
    try {
        const applicationKey = ApplicationKey.fromString(key);
        return ApplicationKey.SYSTEM_RESERVED_APPLICATION_KEYS.some((k) => k.equals(applicationKey));
    } catch {
        return false;
    }
}

function toDto(json: ApplicationJsonExt): ApplicationDto {
    const key = json.key;
    const displayName = firstNonEmpty(json.title, json.displayName) ?? key;
    const name = lastSegment(key);

    return {
        key,
        name,
        displayName,
        description: json.description ?? '',
        version: json.version ?? '',
        state: toState(json.state),
        url: json.url ?? '',
        iconUrl: json.iconUrl ?? '',
        vendorName: json.vendorName ?? '',
        vendorUrl: json.vendorUrl ?? '',
        local: json.local === true,
        system: isSystemApp(key, json.system),
        minSystemVersion: json.minSystemVersion ?? '',
        maxSystemVersion: json.maxSystemVersion ?? '',
    };
}

function lastSegment(applicationKey: string): string {
    const dot = applicationKey.lastIndexOf('.');
    return dot < 0 ? applicationKey : applicationKey.substring(dot + 1);
}

function firstNonEmpty(...values: (string | undefined)[]): string | undefined {
    for (const value of values) {
        if (value && value.length > 0) return value;
    }
    return undefined;
}
