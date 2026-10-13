import type { Application } from '../../../entities/application';
import { matchesEveryWord } from '../../../shared/filter';

/**
 * Display name, description and key, word by word, over the loaded applications. ? The key is searched
 * where other sections leave it out: it does not echo the display name, and admins know apps by it.
 */
export function searchApplications(
  applications: readonly Application[],
  query: string,
): Application[] {
  return applications.filter(({ displayName, description, key }) =>
    matchesEveryWord(query, [displayName, description, key]),
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
