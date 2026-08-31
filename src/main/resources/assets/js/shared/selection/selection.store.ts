import { atom, type ReadableAtom } from 'nanostores';

export type SelectionStore<K extends string = string> = {
  $selected: ReadableAtom<ReadonlySet<K>>;
  toggle: (key: K, checked?: boolean) => void;
  replace: (keys: readonly K[]) => void;
  clear: () => void;
};

export function createSelectionStore<K extends string = string>(): SelectionStore<K> {
  const $selected = atom<ReadonlySet<K>>(new Set<K>());

  return {
    $selected,

    toggle(key, checked) {
      const current = $selected.get();
      const next = checked ?? !current.has(key);
      if (next === current.has(key)) {
        return;
      }

      const updated = new Set(current);
      if (next) {
        updated.add(key);
      } else {
        updated.delete(key);
      }
      $selected.set(updated);
    },

    replace(keys) {
      $selected.set(new Set(keys));
    },

    clear() {
      if ($selected.get().size > 0) {
        $selected.set(new Set<K>());
      }
    },
  };
}
