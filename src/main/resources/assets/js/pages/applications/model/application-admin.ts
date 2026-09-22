import type {
  AdminExtensionItem,
  AdminToolItem,
  ApplicationInfo,
} from '../../../entities/application';
import { filledSections } from '../../../widgets/details-panel/details-panel';
import { compareText } from './application-items';

const TEXT = {
  tools: 'applications.details.tools',
  extensions: 'applications.details.extensions',
} as const;

export type AdminEntry = {
  key: string;
  label: string;
  url?: string;
};

export type AdminGroup = {
  labelKey: string;
  items: readonly AdminEntry[];
};

function adminToolEntries(tools: readonly AdminToolItem[]): AdminEntry[] {
  return tools
    .map(({ key, displayName, url }) => ({ key, label: displayName, url }))
    .sort((a, b) => compareText(a.label, b.label));
}

// Extensions sort by interface before display name
function extensionEntries(extensions: readonly AdminExtensionItem[]): AdminEntry[] {
  return [...extensions]
    .sort(
      (a, b) =>
        compareText(a.interfaces.join(', '), b.interfaces.join(', ')) ||
        compareText(a.displayName, b.displayName),
    )
    .map(({ key, displayName, interfaces }) => ({
      key,
      label: interfaces.length === 0 ? displayName : `${displayName} (${interfaces.join(', ')})`,
    }));
}

/** What an application adds to the admin, in mockup order, groups with nothing in them dropped. */
export function adminGroups(info: ApplicationInfo | undefined): AdminGroup[] {
  if (info == null) {
    return [];
  }

  return filledSections([
    { labelKey: TEXT.tools, items: adminToolEntries(info.adminTools) },
    { labelKey: TEXT.extensions, items: extensionEntries(info.adminExtensions) },
  ]);
}
