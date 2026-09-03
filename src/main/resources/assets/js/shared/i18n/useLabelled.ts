import { useMemo } from 'preact/hooks';

import { i18n } from './i18n';

/**
 * A list whose items carry a phrase key, with each label resolved — once.
 *
 * `useI18n` cannot do this: there are as many labels as the list has items, and a hook cannot be called
 * in a loop. The list itself is what a section or the shell declares as a module constant, so the memo
 * holds for as long as that list is the same array rather than being redone per render — and it resolves
 * in one place even where two components render the same list, as the toolbar and the row menu do.
 */
export function useLabelled<T extends { labelKey: string }>(
  items: readonly T[],
): readonly (T & { label: string })[] {
  return useMemo(() => items.map((item) => ({ ...item, label: i18n(item.labelKey) })), [items]);
}
