/**
 * Error thrown by data-layer functions on non-2xx responses or unexpected payloads.
 * Carries the original cause and, when known, the HTTP status and a message
 * parsed from the response body.
 */
export class AppError extends Error {
    readonly status: number | undefined;
    readonly operation: string | undefined;

    constructor(
        message: string,
        options: {status?: number; operation?: string; cause?: unknown} = {},
    ) {
        super(message);
        this.name = 'AppError';
        this.status = options.status;
        this.operation = options.operation;
        if (options.cause !== undefined) {
            (this as {cause?: unknown}).cause = options.cause;
        }
    }
}

/**
 * Parse a non-OK `Response` and throw a typed `AppError`.
 * Reads the body once and tries JSON first, then text. Never returns.
 */
export async function fromResponse(response: Response, operation: string): Promise<never> {
    let message = `${operation} failed (HTTP ${response.status})`;

    try {
        const text = await response.text();
        if (text) {
            const parsed = safeParseJson(text);
            if (parsed && typeof parsed === 'object') {
                const m = (parsed as Record<string, unknown>).message;
                if (typeof m === 'string' && m.length > 0) {
                    message = m;
                }
            } else if (text.length < 500) {
                message = text;
            }
        }
    } catch {
        // Body was already consumed or unreadable — keep the default message.
    }

    throw new AppError(message, {status: response.status, operation});
}

function safeParseJson(text: string): unknown {
    try {
        return JSON.parse(text);
    } catch {
        return undefined;
    }
}
