import type { ItemInteraction } from '@enonic/ui';
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

/** What `TreeList` may do with each row. A lookup, built once per render: it asks per row on every key press. */
export function rowInteractions(
  rows: readonly BrowseRow[],
  selectable: boolean,
): (key: string) => ItemInteraction {
  const interactions = new Map<string, ItemInteraction>(
    rows.map((row) => [
      row.key,
      row.disabled ? 'none' : selectable && row.selectable !== false ? 'full' : 'navigate-only',
    ]),
  );

  return (key) => interactions.get(key) ?? 'none';
}
