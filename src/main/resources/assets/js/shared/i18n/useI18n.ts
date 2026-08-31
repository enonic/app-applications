import { useMemo } from 'preact/hooks';

import { i18n } from './i18n';
import type { PhraseValue } from './i18n.store';

/**
 * One resolved phrase, for a component to name at the top and render by that name: it lists what it can say
 * before it says it, and its JSX carries values rather than lookups. A key that varies per row cannot go
 * through a hook at all — that is what the plain `i18n()` is for.
 */
export function useI18n(key: string, ...values: PhraseValue[]): string {
  // ! The values are folded into one dependency because a hook's dependency list cannot be variadic,
  // ! and a fresh array per render would leave nothing memoized.
  const args = values.join('');

  return useMemo(() => i18n(key, ...values), [key, args]);
}
