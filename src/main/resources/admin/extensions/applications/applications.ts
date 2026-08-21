import type { Request, Response } from '/lib/xp/core';
import { getMimeType, getResource, readText } from '/lib/xp/io';

const STATIC_BASE = '/_static';
const ASSET_ROOT = '/assets';

export function all(request: Request): Response {
  const path = request.rawPath.slice((request.contextPath ?? '').length);

  // `_static/main.js` is the host's contract-fixed entry, and its chunks resolve beside it.
  if (path.startsWith(`${STATIC_BASE}/`) && !path.includes('..')) {
    return serveText(`${ASSET_ROOT}${path}`);
  }

  return { status: 404 };
}

//
// * Internal
//

// ! lib-static cannot serve anything from this app: it answers with a `ByteSource` body, and GraalJS
// ! hands the serializer a host object, which reaches the browser as a JSON map of its own method
// ! names. See `../app-settings/docs/platform-facts.md`. Text is the only thing that survives, so
// ! nothing binary can be served from here at all.
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
