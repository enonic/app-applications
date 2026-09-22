import type {
  AdminExtensionItem,
  AdminToolItem,
  ApplicationInfo,
} from '../../../entities/application';
import { filledSections } from '../../../widgets/details-panel/details-panel';

const TEXT = {
  tools: 'applications.details.tools',
  extensions: 'applications.details.extensions',
} as const;

export type ExtensionEntry = {
  key: string;
  label: string;
  url?: string;
};

export type ExtensionGroup = {
  labelKey: string;
  items: readonly ExtensionEntry[];
};

function compare(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

function adminToolEntries(tools: readonly AdminToolItem[]): ExtensionEntry[] {
  return tools
    .map(({ key, displayName, url }) => ({ key, label: displayName, url }))
    .sort((a, b) => compare(a.label, b.label));
}

// Extensions sort by interface before display name, so the ones that surface in the same place in the
// admin stay together.
function extensionEntries(extensions: readonly AdminExtensionItem[]): ExtensionEntry[] {
  return [...extensions]
    .sort(
      (a, b) =>
        compare(a.interfaces.join(', '), b.interfaces.join(', ')) ||
        compare(a.displayName, b.displayName),
    )
    .map(({ key, displayName, interfaces }) => ({
      key,
      label: interfaces.length === 0 ? displayName : `${displayName} (${interfaces.join(', ')})`,
    }));
}

/** What an application adds to the admin, in mockup order, groups with nothing in them dropped. */
export function adminGroups(info: ApplicationInfo | undefined): ExtensionGroup[] {
  if (info == null) {
    return [];
  }

  return filledSections([
    { labelKey: TEXT.tools, items: adminToolEntries(info.adminTools) },
    { labelKey: TEXT.extensions, items: extensionEntries(info.adminExtensions) },
  ]);
}
