import type { Request, Response } from '/lib/xp/core';
import { getMimeType, getResource, readText } from '/lib/xp/io';

const STATIC_BASE = '/_static';
const ASSET_ROOT = '/assets';

/** The module the host imports. Served off the extension root, so the host needs no path of its own. */
const MODULE_PATH = `${ASSET_ROOT}/js/section.js`;

// ! lib-router is deliberately not used: its factory is `module.exports = fn`, and a default
// ! import of it makes `vp pack` emit a `_virtual/_rolldown/runtime.js` interop shim into the
// ! app root. Two routes are not worth that.
export function all(request: Request): Response {
  const path = request.rawPath.slice((request.contextPath ?? '').length);

  if (path === '' || path === '/') {
    return serveText(MODULE_PATH);
  }

  // Chunks, and later the stylesheet — the module resolves them relative to its own url.
  if (path.startsWith(`${STATIC_BASE}/`) && !path.includes('..')) {
    return serveText(`${ASSET_ROOT}/${path.slice(STATIC_BASE.length + 1)}`);
  }

  return { status: 404 };
}

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
  // ! `text/javascript`, not `application/javascript`: Jetty assigns no charset to a type it treats
  // ! as binary, and `ResponseSerializer` then throws re-encoding the body.
  if (path.endsWith('.js')) {
    return 'text/javascript; charset=utf-8';
  }
  if (path.endsWith('.css')) {
    return 'text/css; charset=utf-8';
  }

  return `${getMimeType(path)}; charset=utf-8`;
}
