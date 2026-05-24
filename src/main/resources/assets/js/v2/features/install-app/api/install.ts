import type {ApplicationJson} from '@enonic/lib-admin-ui/application/json/ApplicationJson';
import {AppError, fromResponse} from '../../../shared/api/errors/AppError';
import {getServerAppUrl} from '../../../shared/lib/url/api';

//
// * Types
//

export interface InstallResultJson {
    applicationInstalledJson?: ApplicationJson;
    failure?: string;
}

export interface UploadProgressEvent {
    /** Number of bytes uploaded so far. */
    loaded: number;
    /** Total number of bytes to upload, when known. */
    total: number;
}

export interface UploadApplicationParams {
    /** Called when the upload progress changes. */
    onProgress?: (event: UploadProgressEvent) => void;
    /** Optional abort signal — the request is cancelled when it fires. */
    signal?: AbortSignal;
}

//
// * Endpoints
//

/**
 * Installs an application from a remote URL. Heavy operation — no client-side
 * timeout, since the server downloads and verifies the artifact synchronously.
 */
export async function installApplicationFromUrl(url: string, sha512?: string): Promise<InstallResultJson> {
    const body: Record<string, string> = {URL: url};
    if (sha512) body.sha512 = sha512;

    const response = await fetch(getServerAppUrl('installUrl'), {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json;charset=UTF-8',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) await fromResponse(response, 'installApplicationFromUrl');

    return (await response.json()) as InstallResultJson;
}

/**
 * Uploads a jar/zip application file. Uses `XMLHttpRequest` (not `fetch`) so we
 * can surface upload progress; the body is `multipart/form-data` with the file
 * in the `file` field, mirroring the legacy `ApplicationUploaderEl` contract.
 */
export function uploadApplication(file: File, params: UploadApplicationParams = {}): Promise<InstallResultJson> {
    return new Promise<InstallResultJson>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const url = getServerAppUrl('install');

        const formData = new FormData();
        formData.append('file', file, file.name);

        const {onProgress, signal} = params;
        if (onProgress) {
            xhr.upload.addEventListener('progress', (event) => {
                onProgress({loaded: event.loaded, total: event.lengthComputable ? event.total : 0});
            });
        }

        xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    resolve(JSON.parse(xhr.responseText || '{}') as InstallResultJson);
                } catch (cause) {
                    reject(new AppError('uploadApplication failed: invalid JSON response', {
                        status: xhr.status,
                        operation: 'uploadApplication',
                        cause,
                    }));
                }
                return;
            }
            reject(new AppError(parseXhrError(xhr) ?? `uploadApplication failed (HTTP ${xhr.status})`, {
                status: xhr.status,
                operation: 'uploadApplication',
            }));
        });

        xhr.addEventListener('error', () => {
            reject(new AppError('uploadApplication failed: network error', {operation: 'uploadApplication'}));
        });

        xhr.addEventListener('abort', () => {
            reject(new AppError('uploadApplication aborted', {operation: 'uploadApplication'}));
        });

        if (signal) {
            if (signal.aborted) {
                xhr.abort();
            } else {
                signal.addEventListener('abort', () => xhr.abort(), {once: true});
            }
        }

        xhr.open('POST', url);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send(formData);
    });
}

function parseXhrError(xhr: XMLHttpRequest): string | undefined {
    if (!xhr.responseText) return undefined;
    try {
        const parsed = JSON.parse(xhr.responseText) as {message?: unknown};
        if (typeof parsed.message === 'string' && parsed.message.length > 0) return parsed.message;
    } catch {
        // Not JSON — fall through.
    }
    return xhr.responseText.length < 500 ? xhr.responseText : undefined;
}
