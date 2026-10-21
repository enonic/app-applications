import type { ApplicationInfo } from '../../../entities/application';
import { compareText } from './application-items';

export type ApiEntry = {
  key: string;
  label: string;
};

// ? The server already stands the name in for a missing title, so an api shows its name alone
// exactly when the two match; adding the suffix then would read `styles (styles)`.
/** The apis an application serves, by title with the name beside it where the two differ. */
export function apiEntries(info: ApplicationInfo | undefined): ApiEntry[] {
  return (info?.apis ?? [])
    .map(({ key, name, displayName }) => ({
      key,
      label: displayName === name ? name : `${displayName} (${name})`,
    }))
    .sort((a, b) => compareText(a.label, b.label));
}
