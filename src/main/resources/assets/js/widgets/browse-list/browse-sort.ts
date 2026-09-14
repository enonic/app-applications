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

/**
 * Grouped by whatever `valueOf` reads, the display name ordering the items inside one group.
 *
 * ! The direction flips the groups alone. An order named after one field is a grouping by it, so the
 * ! names under a group stay ascending in both directions — reversing them too would make `desc` a
 * ! different order rather than the same one read backwards.
 */
export function sortByValue<T extends { key: string; displayName: string }>(
  items: readonly T[],
  direction: SortDirection,
  valueOf: (item: T) => string,
): T[] {
  const sign = direction === 'desc' ? -1 : 1;

  return [...items].sort((a, b) => {
    const byValue = valueOf(a).localeCompare(valueOf(b), undefined, { sensitivity: 'base' });
    if (byValue !== 0) {
      return sign * byValue;
    }

    const byName = a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' });
    return byName !== 0 ? byName : a.key.localeCompare(b.key);
  });
}
