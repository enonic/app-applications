export type BrowseFilterEntry = {
  id: string;
  label: string;
  /**
   * How many rows fall into this entry, where that is knowable. ! Absent, not zero, when the section
   * narrows on the server: one page cannot be counted per entry. An entry without a count is always
   * offered — nothing tells it apart from an empty one.
   */
  count?: number;
};

/**
 * Drops the entries a search left empty, so the filter offers only what it can narrow to. ! A ticked entry
 * stays whatever its count — hiding it would leave the list narrowed by something invisible and impossible
 * to untick, which is why this is not a plain `count > 0`.
 */
export function visibleEntries(
  entries: readonly BrowseFilterEntry[],
  selected: ReadonlySet<string>,
): BrowseFilterEntry[] {
  return entries.filter(({ id, count }) => count === undefined || count > 0 || selected.has(id));
}
