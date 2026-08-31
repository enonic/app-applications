import type { ReactNode } from 'react';

import { useI18n, useLabelled } from '../../shared/i18n';
import { BrowseLayout } from '../browse-layout/BrowseLayout';
import {
  type BrowseListStatus,
  type BrowseRow,
  selectableKeys,
  selectAllState,
} from '../browse-list/browse-list';
import { BrowseList } from '../browse-list/BrowseList';
import { BrowseListContextMenu } from '../browse-list/BrowseListContextMenu';
import { BrowseListHeader } from '../browse-list/BrowseListHeader';
import { BrowseSearch } from '../browse-search/BrowseSearch';
import {
  rowActivationAction,
  type ActionContext,
  type SectionAction,
} from '../browse-toolbar/actions';
import { BrowseToolbar } from '../browse-toolbar/BrowseToolbar';

export type BrowseScreenProps<T> = {
  actions: readonly SectionAction<T>[];
  context: ActionContext<T>;
  rows: readonly BrowseRow[];
  itemAt: (key: string) => T | undefined;
  status: BrowseListStatus;
  activeKey?: string;
  selectedKeys: ReadonlySet<string>;
  query: string;
  /** Shown when the section itself is empty; a query with no match says so on its own. */
  emptyLabel: string;
  /** The details column, rendered once `activeKey` names a row. */
  details: ReactNode;
  /** Managed mode: no action is offered anywhere — toolbar, row menu or double click. */
  managedMode?: boolean;
  /** What stands in the action row's place, normally `ManagedModeBanner` with the section's copy. */
  notice?: ReactNode;
  onQueryChange: (query: string) => void;
  onSelectionChange: (keys: ReadonlySet<string>) => void;
  onActiveChange: (key: string | undefined) => void;
  onRefresh: () => void;
  filter?: ReactNode;
  sort?: ReactNode;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  loadMoreError?: string;
};

/**
 * The whole browse screen, so a section states its data and actions and nothing else. Every section
 * renders the same toolbar, search, header, list and details column, and the wiring lives here rather
 * than being copied per section.
 */
export function BrowseScreen<T>({
  actions,
  context,
  rows,
  itemAt,
  status,
  activeKey,
  selectedKeys,
  query,
  emptyLabel,
  details,
  managedMode,
  notice,
  onQueryChange,
  onSelectionChange,
  onActiveChange,
  onRefresh,
  filter,
  sort,
  hasMore,
  onLoadMore,
  loadingMore,
  loadMoreError,
}: BrowseScreenProps<T>) {
  const noMatchesLabel = useI18n('browse.list.noMatches');
  const labelledActions = useLabelled(actions);

  /**
   * A double click acts on the row it hit, so the context is built from that row rather than read off the
   * screen — the clicks under it just cleared the ticks and toggled the active row. The action's own
   * `enabled` still decides, and the row stays on show.
   */
  const handleRowActivate = (key: string): void => {
    const active = itemAt(key);
    if (managedMode || active === undefined) {
      return;
    }

    const ctx = { selected: [], active };
    const action = rowActivationAction(actions, ctx);
    if (action === undefined) {
      return;
    }

    onActiveChange(key);
    void action.run(ctx);
  };

  const handleSelectAllChange = (checked: boolean): void => {
    onSelectionChange(checked ? new Set(selectableKeys(rows)) : new Set());
  };

  return (
    <BrowseLayout
      toolbar={managedMode ? notice : <BrowseToolbar actions={labelledActions} context={context} />}
      // The active row is what the shell's url resolved to, so it is also what says whether the
      // details column has anything to show.
      detailsShown={activeKey !== undefined}
      list={
        <>
          <BrowseSearch value={query} onChange={onQueryChange} />

          <BrowseListHeader
            allSelected={managedMode ? undefined : selectAllState(rows, selectedKeys)}
            onSelectAllChange={managedMode ? undefined : handleSelectAllChange}
            onRefresh={onRefresh}
            filter={filter}
            sort={sort}
          />

          {/* The row menu is the toolbar's list, so managed mode empties it and it renders nothing. */}
          <BrowseListContextMenu actions={managedMode ? [] : labelledActions} context={context}>
            <BrowseList
              rows={rows}
              activeKey={activeKey}
              selectedKeys={selectedKeys}
              onSelectionChange={onSelectionChange}
              onActiveChange={onActiveChange}
              onRowActivate={handleRowActivate}
              selectable={managedMode !== true}
              status={status}
              emptyLabel={query.trim() ? noMatchesLabel : emptyLabel}
              hasMore={hasMore}
              onLoadMore={onLoadMore}
              loadingMore={loadingMore}
              loadMoreError={loadMoreError}
            />
          </BrowseListContextMenu>
        </>
      }
      details={details}
    />
  );
}
