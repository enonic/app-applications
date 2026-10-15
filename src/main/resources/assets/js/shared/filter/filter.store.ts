import { EMPTY_FILTER, type FilterQuery } from '@enonic/ui-kit';
import { atom, type ReadableAtom } from 'nanostores';

export type FilterStore = {
  $query: ReadableAtom<FilterQuery>;
  set: (query: FilterQuery) => void;
  clear: () => void;
};

/**
 * The filter of one section: the terms its input holds. One instance per section, created in
 * `pages/<section>/model/`, beside its selection store — the widgets stay stateless and read it
 * through props. The sections stay mounted side by side, so the state cannot be shared.
 */
export function createFilterStore(): FilterStore {
  const $query = atom<FilterQuery>(EMPTY_FILTER);

  return {
    $query,

    set(query) {
      $query.set(query);
    },

    clear() {
      if ($query.get().length > 0) {
        $query.set(EMPTY_FILTER);
      }
    },
  };
}
