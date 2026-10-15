// ! Not namespaced per app, deliberately: every section renders this two-column screen inside the one
// ! shell page, so a width dragged in one is the width the next opens at. The key is the screen's, and
// ! every copy of this file uses it. Whether the family belongs under `xp.admin.*` is still open.
const STORAGE_KEY = 'browse-layout.details-width';

/** Content Studio's `PANEL_MIN_WIDTH` for the same two columns. */
export const MIN_LIST_WIDTH = 300;
export const MIN_DETAILS_WIDTH = 300;
export const DEFAULT_DETAILS_WIDTH = 400;

/** One arrow press on the handle. */
export const RESIZE_STEP = 16;

/** Neither column may squeeze the other below its minimum, whatever the drag asks for. */
export function clampDetailsWidth(width: number, containerWidth: number): number {
  const max = Math.max(MIN_DETAILS_WIDTH, containerWidth - MIN_LIST_WIDTH);
  return Math.round(Math.min(Math.max(width, MIN_DETAILS_WIDTH), max));
}

/**
 * ! Feature-detected and wrapped: Node defines a `localStorage` with no `getItem`, and a privacy mode has
 * ! one that throws on being touched. A remembered column width is not worth taking the screen down for.
 */
function storage(): Storage | undefined {
  try {
    return typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function'
      ? localStorage
      : undefined;
  } catch {
    return undefined;
  }
}

export function readDetailsWidth(): number {
  const stored = Number(storage()?.getItem(STORAGE_KEY));
  return Number.isFinite(stored) && stored > 0 ? stored : DEFAULT_DETAILS_WIDTH;
}

export function writeDetailsWidth(width: number): void {
  try {
    storage()?.setItem(STORAGE_KEY, String(width));
  } catch {
    // A full or blocked store leaves the width unremembered, which is all it costs.
  }
}
