import { execute } from '/lib/graphql';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { post } from './applications';

const CONTEXT =
  '/admin/com.enonic.xp.app.settings/main/_/admin:extension/com.enonic.xp.app.applications:applications';

type Headers = Record<string, string | undefined>;

const SAME_ORIGIN_JSON: Headers = {
  'sec-fetch-site': 'same-origin',
  'content-type': 'application/json',
};

function postRequest(
  path: string,
  headers: Headers = SAME_ORIGIN_JSON,
  body = '{"query":"{ a }"}',
) {
  return {
    rawPath: `${CONTEXT}${path}`,
    contextPath: CONTEXT,
    body,
    getHeader: (name: string) => headers[name.toLowerCase()] ?? null,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('post', () => {
  it('answers 404 for anything but the graphql path', () => {
    expect(post(postRequest('/_static/main.js')).status).toBe(404);
  });

  it('executes a same-origin json request', () => {
    vi.mocked(execute).mockReturnValue({ data: {} });

    expect(post(postRequest('/graphql')).status).toBe(200);
    expect(vi.mocked(execute)).toHaveBeenCalledOnce();
  });

  it('accepts media type parameters and any casing of the media type', () => {
    vi.mocked(execute).mockReturnValue({ data: {} });
    const headers = { ...SAME_ORIGIN_JSON, 'content-type': 'Application/JSON; charset=utf-8' };

    expect(post(postRequest('/graphql', headers)).status).toBe(200);
  });

  it('hands the graphql path to the schema, which rejects an empty body', () => {
    expect(post(postRequest('/graphql', SAME_ORIGIN_JSON, '')).status).toBe(400);
  });

  it.each([
    'cross-site',
    'same-site',
    'none',
    'Same-Origin',
    'same-origin, cross-site',
    '',
    undefined,
  ])('answers 403 without executing when Sec-Fetch-Site is %j', (site) => {
    const response = post(postRequest('/graphql', { ...SAME_ORIGIN_JSON, 'sec-fetch-site': site }));

    expect(response).toEqual({ status: 403 });
    expect(vi.mocked(execute)).not.toHaveBeenCalled();
  });

  it.each([
    'text/plain',
    'application/x-www-form-urlencoded',
    'multipart/form-data; boundary=x',
    'application/jsonp',
    'application/json-seq',
    '',
    undefined,
  ])('answers 415 without executing when Content-Type is %j', (contentType) => {
    const response = post(
      postRequest('/graphql', { ...SAME_ORIGIN_JSON, 'content-type': contentType }),
    );

    expect(response).toEqual({ status: 415 });
    expect(vi.mocked(execute)).not.toHaveBeenCalled();
  });

  it('checks the fetch site before the content type', () => {
    const headers = { 'sec-fetch-site': 'cross-site', 'content-type': 'text/plain' };

    expect(post(postRequest('/graphql', headers)).status).toBe(403);
  });
});
