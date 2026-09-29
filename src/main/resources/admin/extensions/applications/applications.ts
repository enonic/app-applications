import { handleGraphQlRequest, type GraphQlRequest } from '/apis/graphql/request';
import type { Request, Response } from '/lib/xp/core';
import { getMimeType, getResource, readText } from '/lib/xp/io';

/** The two names that locate a call below this extension's prefix. */
type PrefixRequest = Pick<Request, 'rawPath' | 'contextPath'>;

type PostRequest = PrefixRequest & Pick<Request, 'getHeader'> & GraphQlRequest;

const STATIC_BASE = '/_static';
const ASSET_ROOT = '/assets';
const GRAPHQL_PATH = '/graphql';

export function get(request: PrefixRequest): Response {
  const path = extensionPath(request);

  if (path.startsWith(`${STATIC_BASE}/`) && !path.includes('..')) {
    return serveText(`${ASSET_ROOT}${path}`);
  }

  return { status: 404 };
}

export function post(request: PostRequest): Response {
  if (extensionPath(request) !== GRAPHQL_PATH) {
    return { status: 404 };
  }
  if (request.getHeader('Sec-Fetch-Site') !== 'same-origin') {
    return { status: 403 };
  }
  if (!isJson(request.getHeader('Content-Type'))) {
    return { status: 415 };
  }

  return handleGraphQlRequest(request);
}

//
// * Internal
//

/** What the caller asked for below the prefix this extension owns. */
function extensionPath(request: PrefixRequest): string {
  return request.rawPath.slice((request.contextPath ?? '').length);
}

function isJson(contentType: string | null): boolean {
  const mediaType = contentType?.split(';', 1)[0].trim().toLowerCase();
  return mediaType === 'application/json';
}

// ! lib-static cannot serve anything from this app: it answers with a `ByteSource` body, and GraalJS hands
// ! the serializer a host object, which reaches the browser as a JSON map of its own method names. Text is
// ! all that survives, so nothing binary can be served from here at all.
function serveText(path: string): Response {
  const resource = getResource(path);

  if (!resource.exists()) {
    return { status: 404 };
  }

  return {
    status: 200,
    contentType: contentTypeOf(path),
    body: readText(resource.getStream()),
  };
}

function contentTypeOf(path: string): string {
  if (path.endsWith('.js')) {
    return 'text/javascript; charset=utf-8';
  }
  if (path.endsWith('.css')) {
    return 'text/css; charset=utf-8';
  }

  return `${getMimeType(path)}; charset=utf-8`;
}
