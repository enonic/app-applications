export type BrowseFilterEntry = {
  id: string;
  label: string;
  /**
   * How many rows fall into this entry, where that is knowable.
   *
   * ! Absent, not zero, when the section narrows on the server: one page of rows cannot be counted per
   * ! entry, and `findUsers` reports a single total for the whole query. An entry without a count is
   * ! always offered — there is nothing to tell it apart from an empty one.
   */
  count?: number;
};

/**
 * Drops the entries a search left empty, so the filter offers only what it can actually narrow to.
 *
 * A ticked entry stays whatever its count, and that exception is the whole reason this is not a
 * plain `count > 0`: a search can empty the entry a user has ticked, and hiding it then would leave
 * the list narrowed by something invisible and impossible to untick.
 */
export function visibleEntries(
  entries: readonly BrowseFilterEntry[],
  selected: ReadonlySet<string>,
): BrowseFilterEntry[] {
  return entries.filter(({ id, count }) => count === undefined || count > 0 || selected.has(id));
}
