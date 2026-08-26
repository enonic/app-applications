import { useMemo } from 'preact/hooks';

import { i18n } from './i18n';
import type { PhraseValue } from './i18n.store';

/**
 * One resolved phrase, for a component to name at the top and render by that name.
 *
 * The point is the reading order: a component lists what it can say before it says it, and its JSX
 * carries values rather than lookups. Content Studio's `shared/lib/hooks/useI18n.ts` is the same hook.
 *
 * A key that varies per row — a state label inside a `.map`, a mapper called from a store — cannot go
 * through a hook at all. That is what the plain `i18n()` function is for.
 */
export function useI18n(key: string, ...values: PhraseValue[]): string {
  // ! The values are folded into one dependency because a hook's dependency list cannot be variadic,
  // ! and a fresh array per render would leave nothing memoized.
  const args = values.join('');

  return useMemo(() => i18n(key, ...values), [key, args]);
}
