import {fromResponse} from '../../../shared/api/errors/AppError';
import {getServerAppUrl} from '../../../shared/lib/url/api';

const DEFAULT_TIMEOUT_MS = 10_000;

/** Uninstalls the given applications. */
export async function uninstallApplications(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    const response = await fetch(getServerAppUrl('uninstall'), {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify({key: keys}),
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    });

    if (!response.ok) await fromResponse(response, 'uninstallApplications');
}
