import { ResultAsync } from 'neverthrow';

import { AppError } from './errors';

export type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type RequestOptions = {
  method?: RequestMethod;
  /** JSON-serialized into the request body; sets the JSON Content-Type header. */
  body?: unknown;
  signal?: AbortSignal;
};

const toAppError = (error: unknown): AppError =>
  error instanceof AppError ? error : new AppError(String(error), error);

async function readErrorMessage(response: Response): Promise<string | undefined> {
  try {
    const body: unknown = await response.json();
    if (body != null && typeof body === 'object' && 'message' in body) {
      const { message } = body as { message?: unknown };
      return typeof message === 'string' && message.length > 0 ? message : undefined;
    }
  } catch {
    // Non-JSON or empty error body: fall back to the status text.
  }
  return undefined;
}

async function requestRaw(url: string, options: RequestOptions): Promise<Response> {
  const { method = 'GET', body, signal } = options;

  const response = await fetch(url, {
    method,
    signal,
    ...(body !== undefined && {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  });

  if (!response.ok) {
    const fallback = response.statusText || `Request failed with status ${response.status}`;
    throw new AppError((await readErrorMessage(response)) ?? fallback);
  }

  return response;
}

export function requestJson<T>(
  url: string,
  options: RequestOptions = {},
): ResultAsync<T, AppError> {
  return ResultAsync.fromPromise(
    requestRaw(url, options).then((response) => response.json() as Promise<T>),
    toAppError,
  );
}
