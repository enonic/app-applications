/**
 * This section's own sub-path, both ways. The shell owns the url and hands the sub-path over — `''` for the
 * list, `/<key>` for a row — so what a path means is ours, and nothing above knows the shape.
 */

/** The sub-path of the list with nothing on show. */
export const LIST_PATH = '';

/** The sub-path a row's details live at. */
export function itemPath(key: string): string {
  return `/${key}`;
}

/**
 * The row a sub-path names, or `undefined` for the list alone. Only the first segment is read, so a deeper
 * path is still that row's. The value is verbatim: the shell escapes only what hash history would eat.
 */
export function itemKeyFromPath(subPath: string): string | undefined {
  const [path = ''] = subPath.split('?');
  const [first = ''] = path.replace(/^\/+/, '').split('/');

  return first === '' ? undefined : first;
}
