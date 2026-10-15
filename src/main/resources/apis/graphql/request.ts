import { execute, type ExecutionResult } from '/lib/graphql';

import { schema } from './schema';

export type GraphQlRequest = { body?: string | null };

export type GraphQlResponse = {
  status: number;
  contentType: 'application/json';
  body: ExecutionResult | { message: string };
};

type GraphQlOperation = {
  query: string;
  variables?: Record<string, unknown>;
};

/**
 * The data plane, served from this app's own extension prefix: a `kind: API` descriptor would need the
 * *host tool* to list it, i.e. a host release per provider. ! No role check — four gates ran before this
 * module loaded, and re-requiring `role:system.admin` would lock out a narrower `allow`.
 */
export function handleGraphQlRequest(request: GraphQlRequest): GraphQlResponse {
  if (!request.body) {
    return badRequest('Request body is missing');
  }

  let operation: unknown;
  try {
    operation = JSON.parse(request.body);
  } catch {
    return badRequest('Request body is not valid JSON');
  }

  if (!isGraphQlOperation(operation)) {
    return badRequest('Request body carries no `query` string');
  }

  // ! GraphQL answers 200 even when `errors` is populated — the client reads that array, not the
  // ! status. Only a malformed request gets a non-200 from here.
  // `operationName` is deliberately not read: lib-graphql's ExecutionInput ignores it.
  return {
    status: 200,
    contentType: 'application/json',
    body: execute(schema, operation.query, operation.variables),
  };
}

//
// * Internal
//

function isGraphQlOperation(value: unknown): value is GraphQlOperation {
  if (value == null || typeof value !== 'object') {
    return false;
  }
  const { query } = value as Partial<GraphQlOperation>;
  return typeof query === 'string' && query.length > 0;
}

function badRequest(message: string): GraphQlResponse {
  return { status: 400, contentType: 'application/json', body: { message } };
}
