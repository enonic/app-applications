import { atom, type ReadableAtom } from 'nanostores';

export type SearchStore = {
  $query: ReadableAtom<string>;
  set: (query: string) => void;
  clear: () => void;
};

/**
 * The search box of one section. One instance per section, created in `pages/<section>/model/`,
 * beside its selection store — the widgets stay stateless and read it through props.
 */
export function createSearchStore(): SearchStore {
  const $query = atom<string>('');

  return {
    $query,

    set(query) {
      $query.set(query);
    },

    clear() {
      if ($query.get().length > 0) {
        $query.set('');
      }
    },
  };
}
