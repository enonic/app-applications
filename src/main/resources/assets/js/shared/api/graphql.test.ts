import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { requestGraphQlRoots, setGraphQlEndpoint, type GraphQlRoot } from './graphql';

const fetchMock = vi.fn<typeof fetch>();

function sentDocument(): unknown {
  const [, init] = fetchMock.mock.calls[0] ?? [];
  if (typeof init?.body !== 'string') {
    return undefined;
  }
  const body: unknown = JSON.parse(init.body);
  return typeof body === 'object' && body !== null && 'query' in body ? body.query : undefined;
}

const usersRoot: GraphQlRoot = {
  field: 'users',
  args: '(search: $search)',
  selection: '{ total }',
  variables: { search: 'String' },
};

beforeEach(() => {
  fetchMock.mockImplementation(async () => Response.json({ data: {} }));
  vi.stubGlobal('fetch', fetchMock);
  setGraphQlEndpoint('/graphql');
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe('requestGraphQlRoots', () => {
  it('declares a variable used only in the selection', async () => {
    const counts: GraphQlRoot = {
      field: 'idProviders',
      selection: '{ key users(search: $search) { total } }',
      variables: { search: 'String' },
    };

    const result = await requestGraphQlRoots([counts], 'Counts', { values: { search: 'ali' } });

    expect(result.isOk()).toBe(true);
    expect(sentDocument()).toBe(
      'query Counts($search: String) { idProviders { key users(search: $search) { total } } }',
    );
  });

  it('fails without a request on a selection variable the root does not declare', async () => {
    const counts: GraphQlRoot = {
      field: 'idProviders',
      selection: '{ key users(search: $search) { total } }',
    };

    const result = await requestGraphQlRoots([counts], 'Counts');

    expect(result._unsafeUnwrapErr().message).toBe(
      '`idProviders` uses $search without declaring it',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('fails without a request on a declared variable nothing uses', async () => {
    const result = await requestGraphQlRoots(
      [{ field: 'users', selection: '{ total }', variables: { search: 'String' } }],
      'Users',
    );

    expect(result._unsafeUnwrapErr().message).toBe('`users` declares $search without using it');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('declares a variable two roots share once', async () => {
    const counts: GraphQlRoot = {
      field: 'idProviders',
      selection: '{ users(search: $search) { total } }',
      variables: { search: 'String' },
    };

    await requestGraphQlRoots([usersRoot, counts], 'Screen');

    expect(sentDocument()).toBe(
      'query Screen($search: String) { users(search: $search) { total } idProviders { users(search: $search) { total } } }',
    );
  });

  it('fails without a request when two roots disagree on a shared variable', async () => {
    const counts: GraphQlRoot = {
      field: 'idProviders',
      selection: '{ users(search: $search) { total } }',
      variables: { search: 'String!' },
    };

    const result = await requestGraphQlRoots([usersRoot, counts], 'Screen');

    expect(result._unsafeUnwrapErr().message).toBe(
      'Roots disagree on the type of $search: String and String!',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
