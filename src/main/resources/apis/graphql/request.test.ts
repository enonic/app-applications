import { execute } from '/lib/graphql';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { handleGraphQlRequest } from './request';

describe('handleGraphQlRequest', () => {
  beforeEach(() => {
    vi.mocked(execute).mockReturnValue({ data: { probe: { app: 'app-applications' } } });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('answers the execution result for a valid operation', () => {
    const response = handleGraphQlRequest({ body: '{"query":"{ probe }"}' });

    expect(response).toEqual({
      status: 200,
      contentType: 'application/json',
      body: { data: { probe: { app: 'app-applications' } } },
    });
  });

  it('forwards variables to the schema', () => {
    handleGraphQlRequest({
      body: '{"query":"query Q($k: String){ x(key: $k) }","variables":{"k":"app"}}',
    });

    expect(vi.mocked(execute).mock.calls[0]?.[2]).toEqual({ k: 'app' });
  });

  it('answers 200 even when the result carries errors, since the client reads the array', () => {
    vi.mocked(execute).mockReturnValue({ errors: [{ message: 'Field undefined' }] });

    const response = handleGraphQlRequest({ body: '{"query":"{ nope }"}' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ errors: [{ message: 'Field undefined' }] });
  });

  it('rejects a missing body without reaching the schema', () => {
    const response = handleGraphQlRequest({});

    expect(response).toEqual({
      status: 400,
      contentType: 'application/json',
      body: { message: 'Request body is missing' },
    });
    expect(vi.mocked(execute)).not.toHaveBeenCalled();
  });

  it('rejects a body that is not valid JSON', () => {
    expect(handleGraphQlRequest({ body: 'not json' }).body).toEqual({
      message: 'Request body is not valid JSON',
    });
  });

  it('rejects a body carrying no query', () => {
    expect(handleGraphQlRequest({ body: '{"variables":{}}' }).body).toEqual({
      message: 'Request body carries no `query` string',
    });
  });

  it('rejects an empty query string', () => {
    expect(handleGraphQlRequest({ body: '{"query":""}' }).body).toEqual({
      message: 'Request body carries no `query` string',
    });
  });
});
