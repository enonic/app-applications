export type SortDirection = 'asc' | 'desc';

export const DEFAULT_SORT_DIRECTION: SortDirection = 'asc';

/**
 * By display name, case-insensitive, with the key breaking ties.
 *
 * The tie-break is what makes the order total: items that share a display name — project roles do,
 * by construction — would otherwise swap places between renders. Section-agnostic: every browse item
 * has these two fields, and what they name is the page's business.
 */
export function sortByDisplayName<T extends { key: string; displayName: string }>(
  items: readonly T[],
  direction: SortDirection,
): T[] {
  const sign = direction === 'desc' ? -1 : 1;

  return [...items].sort((a, b) => {
    const byName = a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' });
    return sign * (byName !== 0 ? byName : a.key.localeCompare(b.key));
  });
}
