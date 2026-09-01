import { useMemo } from 'preact/hooks';

import { i18n } from './i18n';

/**
 * A list whose items carry a phrase key, each label resolved once. `useI18n` cannot: a hook cannot be
 * called in a loop. The list is a module constant, so the memo holds while it is the same array — and it
 * resolves in one place even where two components render it, as the toolbar and the row menu do.
 */
export function useLabelled<T extends { labelKey: string }>(
  items: readonly T[],
): readonly (T & { label: string })[] {
  return useMemo(() => items.map((item) => ({ ...item, label: i18n(item.labelKey) })), [items]);
}
