import type { DetailStatus } from '../../shared/detail';

/**
 * What a panel with no item says, which is three different things. ! Loading, failed and gone are not one
 * state: behind a debounce and a queue, `loading` keeps a selection from reading as a dead click, `failed`
 * carries the section's own phrase, and anything else is the plain empty column.
 */
export function detailsEmptyLabelKey(status: DetailStatus, failedLabelKey: string): string {
  if (status === 'loading') {
    return 'browse.details.loading';
  }

  return status === 'error' ? failedLabelKey : 'browse.details.empty';
}

/** A section or subsection label with its entry count: `Members (8)`. */
export function withCount(label: string, count: number | undefined): string {
  return count === undefined ? label : `${label} (${count})`;
}

/**
 * The sections worth rendering: an empty one is a label and a rule over blank space, so it is dropped
 * rather than shown as `Members (0)`. Generic, so a caller can carry an icon alongside its items.
 */
export function filledSections<S extends { items: readonly unknown[] }>(
  sections: readonly S[],
): S[] {
  return sections.filter(({ items }) => items.length > 0);
}

/**
 * The same where the size is known before the contents. A set only counted still earns its heading, so
 * emptiness is decided by `total` rather than by how many rows arrived.
 */
export function countedSections<S extends { set: { total: number } }>(sections: readonly S[]): S[] {
  return sections.filter(({ set }) => set.total > 0);
}
