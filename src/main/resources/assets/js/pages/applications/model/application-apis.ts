import type { ApplicationInfo } from '../../../entities/application';
import { compareText } from './application-items';

export type ApiEntry = {
  key: string;
  label: string;
};

/** The apis an application serves, by title, the name standing in where a descriptor has none. */
export function apiEntries(info: ApplicationInfo | undefined): ApiEntry[] {
  return (info?.apis ?? [])
    .map(({ key, name, displayName }) => ({
      key,
      label: displayName.length === 0 ? name : displayName,
    }))
    .sort((a, b) => compareText(a.label, b.label));
}
