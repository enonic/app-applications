import { Button, TreeList } from '@enonic/ui';
import { useState } from 'preact/hooks';

import { useI18n } from '../../shared/i18n';
import {
  type BrowseListStatus,
  type BrowseRow,
  contextMenuTarget,
  rowClickTarget,
  rowInteractions,
  type RowTarget,
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
  /** A row was double-clicked or `Enter` was pressed on it. Undefined where the section declared no row action. */
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
  // ! The cursor is the row the user last pointed at, and it does not follow the details column:
  // ! unticking a row moves the column to the row ticked before it, while the focus stays under the
  // ! hand that unticked. `TreeList` owns the focus for it.
  const [cursorKey, setCursorKey] = useState(activeKey);

  // ! Only with nothing to show. A section that narrows on the server reloads on every debounced
  // ! keystroke, and swapping the rows for a skeleton each time would throw away the scroll position and
  // ! any focus inside the list several times a second. Rows already on screen stay until the new ones
  // ! arrive; they are the best answer available until then.
  if (status === 'loading' && rows.length === 0) {
    return <BrowseListSkeleton />;
  }

  if (status === 'error') {
    return <BrowseListMessage tone="error">{errorMessage}</BrowseListMessage>;
  }

  if (rows.length === 0) {
    return <BrowseListMessage>{emptyLabel ?? emptyMessage}</BrowseListMessage>;
  }

  const interactionOf = rowInteractions(rows, selectable);

  const handleSelectedChange = (key: string, checked: boolean): void => {
    // Which row the details column ends up on is `shownRowKey`, applied wherever a selection
    // change is reported — a tick, `Select all`, a right-click, `Space` — not here.
    onSelectionChange(toggledSelection(selectedKeys, key, checked));
    setCursorKey(key);
  };

  // The keyboard moved the cursor. With nothing ticked the details follow it; with ticks it moves alone.
  const handleCursorChange = (key: string | undefined): void => {
    setCursorKey(key);
    if (key !== undefined && selectedKeys.size === 0) {
      onActiveChange(key);
    }
  };

  const applyRowTarget = (
    key: string,
    { clearSelection, activate, deactivate }: RowTarget,
  ): void => {
    setCursorKey(key);

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
   * ! Outside the tree, though inside the scroller. A `role="tree"` may only hold items, so a button
   * ! among the rows is invisible to anything navigating by item — and when the last page arrives
   * ! `hasMore` goes false, the button unmounts under the keyboard, and the focus falls to the
   * ! document body.
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
      {/* ! `selection` is the real ticks only; the active row without ticks is painted by `BrowseListRow`. */}
      <TreeList
        aria-label={listLabel}
        className="flex flex-col gap-y-1.5"
        selectionMode={selectable ? 'multiple' : 'none'}
        selection={selectedKeys}
        onSelectionChange={onSelectionChange}
        active={cursorKey}
        onActiveChange={handleCursorChange}
        onActivate={onRowActivate}
        getItemInteraction={interactionOf}
      >
        {rows.map((row) => (
          <BrowseListRow
            key={row.key}
            row={row}
            selected={selectedKeys.has(row.key)}
            highlighted={
              selectedKeys.has(row.key) || (row.key === activeKey && selectedKeys.size === 0)
            }
            onSelectedChange={selectable ? handleSelectedChange : undefined}
            onClick={(key) => applyRowTarget(key, rowClickTarget(key, selectedKeys, activeKey))}
            onContextMenu={(key) =>
              applyRowTarget(key, contextMenuTarget(key, selectedKeys, activeKey))
            }
          />
        ))}
      </TreeList>

      {loadMore}
    </div>
  );
}
