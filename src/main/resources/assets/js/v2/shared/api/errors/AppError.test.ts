import {describe, expect, it} from 'vitest';
import {AppError, fromResponse} from './AppError';

function makeResponse(body: string, status: number, contentType = 'application/json'): Response {
    return new Response(body, {status, headers: {'Content-Type': contentType}});
}

describe('AppError', () => {
    it('captures message, status, operation and cause', () => {
        const cause = new Error('underlying');
        const err = new AppError('failed', {status: 500, operation: 'listX', cause});

        expect(err).toBeInstanceOf(Error);
        expect(err.name).toBe('AppError');
        expect(err.message).toBe('failed');
        expect(err.status).toBe(500);
        expect(err.operation).toBe('listX');
        expect((err as unknown as {cause: unknown}).cause).toBe(cause);
    });

    it('defaults all extra fields to undefined', () => {
        const err = new AppError('boom');

        expect(err.status).toBeUndefined();
        expect(err.operation).toBeUndefined();
        expect((err as unknown as {cause: unknown}).cause).toBeUndefined();
    });
});

describe('fromResponse', () => {
    it('uses JSON `message` from the body when present', async () => {
        const response = makeResponse(JSON.stringify({message: 'not allowed'}), 403);
        await expect(fromResponse(response, 'doX')).rejects.toMatchObject({
            name: 'AppError',
            message: 'not allowed',
            status: 403,
            operation: 'doX',
        });
    });

    it('falls back to plain text body when short and not JSON', async () => {
        const response = makeResponse('something broke', 502, 'text/plain');
        await expect(fromResponse(response, 'doX')).rejects.toMatchObject({
            message: 'something broke',
            status: 502,
        });
    });

    it('falls back to a default message when the body is empty', async () => {
        const response = makeResponse('', 500);
        await expect(fromResponse(response, 'doX')).rejects.toMatchObject({
            message: 'doX failed (HTTP 500)',
            status: 500,
        });
    });

    it('falls back to a default message when JSON has no `message`', async () => {
        const response = makeResponse(JSON.stringify({error: 'oops'}), 400);
        await expect(fromResponse(response, 'doX')).rejects.toMatchObject({
            message: 'doX failed (HTTP 400)',
            status: 400,
        });
    });

    it('ignores very long plain-text bodies', async () => {
        const longBody = 'x'.repeat(600);
        const response = makeResponse(longBody, 500, 'text/plain');
        await expect(fromResponse(response, 'doX')).rejects.toMatchObject({
            message: 'doX failed (HTTP 500)',
        });
    });
});
