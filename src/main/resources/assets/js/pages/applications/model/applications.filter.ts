import type { Application } from '../../../entities/application';
import type { BrowseFilterEntry } from '../../../widgets/browse-list/browse-filter';

/**
 * Display name, description and key, case-insensitive, over the loaded applications. ? The key is searched
 * where other sections leave it out: it does not echo the display name, and admins know apps by it.
 */
export function searchApplications(
  applications: readonly Application[],
  query: string,
): Application[] {
  const needle = query.trim().toLowerCase();
  if (needle.length === 0) {
    return [...applications];
  }

  return applications.filter(({ displayName, description, key }) =>
    [displayName, description, key].some((field) => field?.toLowerCase().includes(needle) ?? false),
  );
}

export const SYSTEM_ENTRY = 'system';

/**
 * The one entry this section offers, an include toggle rather than a bucket. ! Inverted against every other
 * filter, where nothing ticked narrows nothing: the applications XP ships are noise, so they start hidden
 * and ticking reveals them — as the app this replaces did, off by default.
 */
export function filterApplicationsBySystem(
  applications: readonly Application[],
  selected: ReadonlySet<string>,
): Application[] {
  if (selected.has(SYSTEM_ENTRY)) {
    return [...applications];
  }

  return applications.filter(({ system }) => !system);
}

/**
 * The entry, counted over the searched applications: how many ticking would reveal. ! Offered whatever the
 * count — hiding it at zero would go on hiding rows with no control left to reveal them.
 */
export function systemEntry(matched: readonly Application[], label: string): BrowseFilterEntry {
  return {
    id: SYSTEM_ENTRY,
    label,
    count: matched.filter(({ system }) => system).length,
  };
}
