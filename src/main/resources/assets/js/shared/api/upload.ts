import { ResultAsync } from 'neverthrow';

import { AppError } from './errors';

export type UploadOptions = {
  /** Multipart payload, sent as-is so the browser writes the boundary. */
  formData: FormData;
  /** How much of the body has gone out, 0–100, capped below 100 until the answer arrives. */
  onProgress?: (percent: number) => void;
};

/** The last byte leaving is not the work finishing — the server still has to act on it. */
const IN_FLIGHT_CAP = 99;

/** POSTs a multipart body and reads a JSON answer, reporting how much of it has gone out. */
export function requestUploadJson<T>(
  url: string,
  { formData, onProgress }: UploadOptions,
): ResultAsync<T, AppError> {
  return ResultAsync.fromPromise(
    new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress?.(Math.min((event.loaded / event.total) * 100, IN_FLIGHT_CAP));
        }
      };

      xhr.onerror = () => reject(new AppError('Network error'));

      xhr.onload = () => {
        if (xhr.status < 200 || xhr.status >= 300) {
          reject(toXhrError(xhr));
          return;
        }

        onProgress?.(100);

        try {
          resolve(JSON.parse(xhr.responseText) as T);
        } catch (error) {
          reject(new AppError('The server answered with something other than JSON', error));
        }
      };

      xhr.open('POST', url);
      xhr.send(formData);
    }),
    (error) => (error instanceof AppError ? error : new AppError(String(error), error)),
  );
}

// *
// * Internal
// *

function toXhrError(xhr: XMLHttpRequest): AppError {
  try {
    const body: unknown = JSON.parse(xhr.responseText);
    if (body != null && typeof body === 'object' && 'message' in body) {
      const { message } = body as { message?: unknown };
      if (typeof message === 'string' && message.length > 0) {
        return new AppError(message);
      }
    }
  } catch {
    // Non-JSON or empty error body: fall back to the status text.
  }

  return new AppError(xhr.statusText || `Request failed with status ${xhr.status}`);
}
