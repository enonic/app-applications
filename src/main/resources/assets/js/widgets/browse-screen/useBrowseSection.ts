import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import type { SearchStore } from '../../shared/search';
import type { SelectionStore } from '../../shared/selection';
import { type BrowseListStatus, type BrowseRow, shownRowKey } from '../browse-list/browse-list';
import type { ActionContext } from '../browse-toolbar/actions';

export type BrowseSectionOptions<T extends { key: string }> = {
  /**
   * The row on show, read off the section's own sub-path. ! Passed in rather than read here: the shell owns
   * the url, so only the section can say which of its own paths names an item.
   */
  activeKey: string | undefined;
  /**
   * Navigation, the section's for the same reason: what a key looks like in the sub-path is its own. Both
   * `replace` — the active row moves with the arrow keys, and every step would land in the history.
   */
  openItem: (key: string) => void;
  closeItem: () => void;
  items: readonly T[];
  status: BrowseListStatus;
  /** The section's own stores, from `pages/<section>/model/`. */
  selection: SelectionStore;
  search: SearchStore;
  /** Per-section narrowing cleared on leaving, beside the selection and query — a bucket filter. */
  resetOnLeave?: readonly { clear: () => void }[];
  /**
   * `items` after the section's own search, bucket filter and sort. Computed by the section rather than a
   * callback because it needs the intermediate result anyway — a filter's counts are taken over the
   * searched items. Narrowing is the section's business; rows, scope and handlers are this hook's.
   */
  visible: readonly T[];
  toRow: (item: T) => BrowseRow;
  /**
   * Rows for work in flight, above the list and outside the query — they are not items yet, so nothing can
   * search or sort them. `disabled` keeps them out of the selection and the keyboard cursor.
   */
  leadingRows?: readonly BrowseRow[];
  reload: () => void;
};

export type BrowseSection<T> = {
  rows: readonly BrowseRow[];
  /**
   * The item a row key names. ! What a double click resolves against: the two clicks under it move the
   * active row and the second clears it, so the action context no longer names the row that was hit.
   */
  itemAt: (key: string) => T | undefined;
  status: BrowseListStatus;
  activeKey: string | undefined;
  selectedKeys: ReadonlySet<string>;
  query: string;
  context: ActionContext<T>;
  onQueryChange: (query: string) => void;
  onSelectionChange: (keys: ReadonlySet<string>) => void;
  onActiveChange: (key: string | undefined) => void;
  onRefresh: () => void;
};

/**
 * Everything `BrowseScreen` needs, from a section's items and stores: rows, the action context, and the
 * handlers behind refresh, selection and the active row. The section keeps its data, mappers and actions.
 */
export function useBrowseSection<T extends { key: string }>({
  activeKey,
  openItem,
  closeItem,
  items,
  status,
  selection,
  search,
  resetOnLeave,
  visible,
  toRow,
  leadingRows,
  reload,
}: BrowseSectionOptions<T>): BrowseSection<T> {
  const selectedKeys = useStore(selection.$selected);
  const query = useStore(search.$query);

  useEffect(() => {
    return () => {
      selection.clear();
      search.clear();
      resetOnLeave?.forEach((store) => store.clear());
    };
    // ? The stores outlive the page, so the cleanup only has to run when it unmounts.
  }, []);

  return {
    rows: [...(leadingRows ?? []), ...visible.map(toRow)],
    itemAt: (key) => items.find((item) => item.key === key),
    status,
    activeKey,
    selectedKeys,
    query,
    context: {
      // ! Only the ticks on screen: a query hides rows without unticking them, and an action must
      // ! never reach a row the user cannot see. Content Studio scopes the same way, through its
      // ! loadedSelectionCount. The hidden ticks stay in the store and come back with the query.
      selected: visible.filter(({ key }) => selectedKeys.has(key)),
      active: items.find(({ key }) => key === activeKey),
    },
    onQueryChange: search.set,
    onSelectionChange: (keys) => {
      selection.replace([...keys]);

      // The details column follows the selection: it stays on a row that is ticked, and moves to
      // the row ticked last when it is not. Ticking therefore never leaves it on a row from before.
      const shown = shownRowKey(keys, activeKey);
      if (shown !== undefined && shown !== activeKey) {
        openItem(shown);
      }
    },
    onActiveChange: (key) => {
      if (key === undefined) {
        closeItem();
        return;
      }

      openItem(key);
    },
    onRefresh: () => {
      selection.clear();
      reload();
    },
  };
}
