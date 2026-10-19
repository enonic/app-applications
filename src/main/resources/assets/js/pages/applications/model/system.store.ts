import { atom } from 'nanostores';

/**
 * Whether the list shows the applications XP ships. ? Kept on leaving the section, unlike the filter:
 * it is a view preference rather than a search.
 */
export const $systemShown = atom(false);

export function setSystemShown(shown: boolean): void {
  $systemShown.set(shown);
}
