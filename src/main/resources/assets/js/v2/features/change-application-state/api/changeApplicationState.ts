import {fromResponse} from '../../../shared/api/errors/AppError';
import {getServerAppUrl, type ServerAppAction} from '../../../shared/lib/url/api';

const DEFAULT_TIMEOUT_MS = 10_000;

/** Starts the given applications. */
export async function startApplications(keys: string[]): Promise<void> {
    await postAction('start', keys, 'startApplications');
}

/** Stops the given applications. */
export async function stopApplications(keys: string[]): Promise<void> {
    await postAction('stop', keys, 'stopApplications');
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
