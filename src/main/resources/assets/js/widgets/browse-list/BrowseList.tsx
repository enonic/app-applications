import { Button } from '@enonic/ui';
import type { JSX } from 'preact';
import { useState } from 'preact/hooks';

import { useI18n } from '../../shared/i18n';
import {
  type BrowseListStatus,
  type BrowseRow,
  contextMenuTarget,
  nextRowKey,
  type RowTarget,
  rowClickTarget,
  selectableKeys,
  tabbableRowKey,
  toggledSelection,
} from './browse-list';
import { BrowseListMessage } from './BrowseListMessage';
import { BrowseListRow } from './BrowseListRow';
import { BrowseListSkeleton } from './BrowseListSkeleton';

export type BrowseListProps = {
  rows: readonly BrowseRow[];
  activeKey?: string;
  selectedKeys: ReadonlySet<string>;
  /** The whole selection, whether a tick, a right-click or `Space` changed it. */
  onSelectionChange: (keys: ReadonlySet<string>) => void;
  /** The row the user moved to, `undefined` when the active row was clicked again. */
  onActiveChange: (key: string | undefined) => void;
  /** A row was double-clicked. Undefined where the section declared no row action. */
  onRowActivate?: (key: string) => void;
  /** Rows can be ticked. */
  selectable?: boolean;
  status: BrowseListStatus;
  emptyLabel?: string;
  /** Paging is the entity store's job; the list only reports it hit the end. */
  hasMore?: boolean;
  onLoadMore?: () => void;
  /** A page is on its way: the control says so and refuses a second click. */
  loadingMore?: boolean;
  /** Why the last page did not arrive. Shown beside the control, since the rows are still valid. */
  loadMoreError?: string;
};

export function BrowseList({
  rows,
  activeKey,
  selectedKeys,
  onSelectionChange,
  onActiveChange,
  onRowActivate,
  selectable = true,
  status,
  emptyLabel,
  hasMore,
  onLoadMore,
  loadingMore,
  loadMoreError,
}: BrowseListProps) {
  const loadMoreLabel = useI18n(
    loadingMore === true ? 'browse.list.loadingMore' : 'browse.list.loadMore',
  );
  const errorMessage = useI18n('browse.list.error');
  const emptyMessage = useI18n('browse.list.empty');
  const listLabel = useI18n('browse.list.label');
  // ! Above the early returns, where a hook cannot go. The cursor is the row the user last pointed at and
  // ! nothing else moves it: it starts where a deep link opened, and deliberately does not follow the
  // ! details column — unticking moves that column, and the focus must stay under the hand that unticked.
  const [pointedKey, setPointedKey] = useState(activeKey);

  // ! Only with nothing to show. A section narrowing on the server reloads on every debounced keystroke,
  // ! and swapping rows for a skeleton each time would throw away the scroll position and any focus inside
  // ! the list — rows on screen are the best answer until the new ones arrive.
  if (status === 'loading' && rows.length === 0) {
    return <BrowseListSkeleton />;
  }

  if (status === 'error') {
    return <BrowseListMessage tone="error">{errorMessage}</BrowseListMessage>;
  }

  if (rows.length === 0) {
    return <BrowseListMessage>{emptyLabel ?? emptyMessage}</BrowseListMessage>;
  }

  // ! Resolved against the rows on screen, never the stored key alone: a query can filter the
  // ! pointed row out, and then the tab stop, the focus, the arrows and Space must all agree on
  // ! the first visible row instead of acting on a row nobody can see.
  const cursorKey = tabbableRowKey(rows, pointedKey);

  const handleSelectedChange = (key: string, checked: boolean): void => {
    // Which row the details column ends up on is `shownRowKey`, applied wherever a selection
    // change is reported — a tick, `Select all`, a right-click, `Escape` — not here.
    onSelectionChange(toggledSelection(selectedKeys, key, checked));
    setPointedKey(key);
  };

  const handleKeyDown = (event: JSX.TargetedKeyboardEvent<HTMLDivElement>): void => {
    // ! Rows only. A click on a row checkbox leaves the focus on its hidden input, and
    // ! Space there must tick that row, not whichever row happens to be active.
    if (!(event.target instanceof HTMLElement) || event.target.getAttribute('role') !== 'option') {
      return;
    }

    const nextKey = nextRowKey(rows, cursorKey, event.key);
    if (nextKey !== undefined) {
      event.preventDefault();
      setPointedKey(nextKey);

      // Nothing ticked: the cursor and the row on show are the same thing, so the details follow.
      if (selectedKeys.size === 0) {
        onActiveChange(nextKey);
      }
      return;
    }

    if (
      event.key === ' ' &&
      selectable &&
      cursorKey !== undefined &&
      selectableKeys(rows).includes(cursorKey)
    ) {
      event.preventDefault();
      handleSelectedChange(cursorKey, !selectedKeys.has(cursorKey));
    }
  };

  const applyRowTarget = (
    key: string,
    { clearSelection, activate, deactivate }: RowTarget,
  ): void => {
    setPointedKey(key);

    if (clearSelection) {
      onSelectionChange(new Set());
    }
    if (deactivate === true) {
      onActiveChange(undefined);
      return;
    }
    if (activate !== undefined) {
      onActiveChange(activate);
    }
  };

  /*
   * ! Outside the listbox, inside the scroller. A `role="listbox"` may hold only options, so a button among
   * ! the rows is invisible to option navigation — and on the last page `hasMore` goes false, the button
   * ! unmounts under the keyboard, and focus falls to the document body.
   */
  const loadMore =
    hasMore && onLoadMore ? (
      <div className="flex flex-col items-center gap-1.5 p-2.5">
        {/* ! Not disabled while a page is on its way, though it says so. A browser blurs a disabled
            ! element, so a keyboard user who activates this would lose their place on every click — and
            ! the section already refuses a second request while one is in flight, which is the guard that
            ! matters. The label is the feedback; the state is not a gate. */}
        <Button variant="filled" size="sm" label={loadMoreLabel} onClick={onLoadMore} />
        {loadMoreError !== undefined && (
          <p role="status" className="text-error text-xs">
            {loadMoreError}
          </p>
        )}
      </div>
    ) : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div
        role="listbox"
        aria-multiselectable={selectable}
        aria-label={listLabel}
        onKeyDown={handleKeyDown}
        className="flex flex-col gap-y-1.5"
      >
        {rows.map((row) => (
          <BrowseListRow
            key={row.key}
            row={row}
            selected={selectedKeys.has(row.key)}
            focused={row.key === cursorKey}
            highlighted={
              selectedKeys.has(row.key) || (row.key === activeKey && selectedKeys.size === 0)
            }
            onSelectedChange={selectable ? handleSelectedChange : undefined}
            onClick={(key) => applyRowTarget(key, rowClickTarget(key, selectedKeys, activeKey))}
            onActivate={(key) => onRowActivate?.(key)}
            onContextMenu={(key) =>
              applyRowTarget(key, contextMenuTarget(key, selectedKeys, activeKey))
            }
          />
        ))}
      </div>

      {loadMore}
    </div>
  );
}
