import type { ReactNode } from 'react';

export type BrowseListStatus = 'loading' | 'ready' | 'error';

export type BrowseRow = {
  /** Stable id: selection key and `/{section}/$id` route param. */
  key: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  /** Right-aligned cells, in order, provenance last. Keep to three or fewer. */
  meta?: readonly ReactNode[];
  /** Transient row: no navigation, no checkbox. Progress goes in `meta`. */
  disabled?: boolean;
  /**
   * An item that is idle rather than unavailable. Presentation only — the row opens,
   * ticks and acts exactly as an undimmed one, and the paint lifts wherever the row is highlighted.
   */
  dimmed?: boolean;
  /**
   * An item that is not the operator's to act on: the row opens and navigates as any other, and its
   * checkbox is greyed out. Defaults to selectable, as `@enonic/ui`'s own `TreeList` row does.
   */
  selectable?: boolean;
};

/** The rows a tick or `Select all` may reach. */
export function selectableKeys(rows: readonly BrowseRow[]): string[] {
  return rows.filter((row) => !row.disabled && row.selectable !== false).map((row) => row.key);
}

// The wider set: an unselectable row is still a row, so the arrows and the tab stop have to land on
// it. Only a transient one is out.
function navigableKeys(rows: readonly BrowseRow[]): string[] {
  return rows.filter((row) => !row.disabled).map((row) => row.key);
}

/**
 * `Select all` covers the rows currently loaded, not every row matching the query —
 * nothing here can know about the rest.
 */
export function selectAllState(
  rows: readonly BrowseRow[],
  selectedKeys: ReadonlySet<string>,
): boolean | 'indeterminate' {
  const keys = selectableKeys(rows);
  if (keys.length === 0) {
    return false;
  }

  const selected = keys.filter((key) => selectedKeys.has(key)).length;
  if (selected === 0) {
    return false;
  }

  return selected === keys.length ? true : 'indeterminate';
}

/** The selection a tick leaves behind. */
export function toggledSelection(
  selectedKeys: ReadonlySet<string>,
  key: string,
  checked: boolean,
): ReadonlySet<string> {
  const next = new Set(selectedKeys);
  if (checked) {
    next.add(key);
  } else {
    next.delete(key);
  }
  return next;
}

export type RowTarget = {
  /** Drop the ticks. */
  clearSelection: boolean;
  /** The row to make active; absent when the active row must stay where it is. */
  activate?: string;
  /** Clear the active row, which closes the details column. */
  deactivate?: boolean;
};

/**
 * What a click on a row does, following Content Studio's tree: the active row and the ticked rows
 * are alternatives, not a pair, so a click anywhere but the checkbox drops the ticks. With nothing
 * ticked, a second click on the active row clears it.
 */
export function rowClickTarget(
  key: string,
  selectedKeys: ReadonlySet<string>,
  activeKey: string | undefined,
): RowTarget {
  if (selectedKeys.size > 0) {
    return key === activeKey ? { clearSelection: true } : { clearSelection: true, activate: key };
  }

  return key === activeKey
    ? { clearSelection: false, deactivate: true }
    : { clearSelection: false, activate: key };
}

/**
 * The same for a right-click, with one difference: right-clicking one of the ticked rows keeps the
 * whole set, because the menu is about to act on all of it.
 */
export function contextMenuTarget(
  key: string,
  selectedKeys: ReadonlySet<string>,
  activeKey: string | undefined,
): RowTarget {
  if (selectedKeys.has(key)) {
    return { clearSelection: false };
  }

  return {
    clearSelection: selectedKeys.size > 0,
    ...(key === activeKey ? {} : { activate: key }),
  };
}

/**
 * The row the details column shows once the selection has changed — Content Studio's `currentItem`:
 * the row ticked last while anything is ticked, and the row already on show once nothing is. Tick
 * order is the order of the set, so every path that reports a selection has to preserve it.
 */
export function shownRowKey(
  selection: ReadonlySet<string>,
  shownKey: string | undefined,
): string | undefined {
  if (selection.size === 0) {
    return shownKey;
  }

  return [...selection].pop();
}

/**
 * The row `Tab` reaches. The active row owns the tab stop, but it is not always in the list — a
 * query can filter it out, and it can be gone or not loaded yet — and then the first row takes
 * over: without the fallback the list has no tab stop at all and cannot be entered.
 */
export function tabbableRowKey(
  rows: readonly BrowseRow[],
  activeKey: string | undefined,
): string | undefined {
  const keys = navigableKeys(rows);
  return activeKey !== undefined && keys.includes(activeKey) ? activeKey : keys[0];
}

/** The row an arrow, `Home` or `End` press moves to; `undefined` for any other key. */
export function nextRowKey(
  rows: readonly BrowseRow[],
  activeKey: string | undefined,
  pressedKey: string,
): string | undefined {
  const keys = navigableKeys(rows);
  if (keys.length === 0) {
    return undefined;
  }

  const index = activeKey === undefined ? -1 : keys.indexOf(activeKey);

  switch (pressedKey) {
    case 'ArrowDown':
      return keys[Math.min(index + 1, keys.length - 1)];
    case 'ArrowUp':
      return index <= 0 ? keys[0] : keys[index - 1];
    case 'Home':
      return keys[0];
    case 'End':
      return keys[keys.length - 1];
    default:
      return undefined;
  }
}
