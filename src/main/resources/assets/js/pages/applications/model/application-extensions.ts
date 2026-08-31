import type {
  AdminExtensionItem,
  AdminToolItem,
  ApiItem,
  ApplicationInfo,
} from '../../../entities/application';
import { filledSections } from '../../../widgets/details-panel/details-panel';

const TEXT = {
  adminTools: 'applications.details.adminTools',
  widgets: 'applications.details.widgets',
  apis: 'applications.details.apis',
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

// Widgets sort by interface before display name, so the ones that surface in the same place in the
// admin stay together.
function widgetEntries(extensions: readonly AdminExtensionItem[]): ExtensionEntry[] {
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

function apiEntries(apis: readonly ApiItem[]): ExtensionEntry[] {
  return apis
    .map(({ key, name, displayName }) => ({
      key,
      label: displayName.length === 0 ? name : displayName,
    }))
    .sort((a, b) => compare(a.label, b.label));
}

/** What an application adds to the admin, in mockup order, groups with nothing in them dropped. */
export function extensionGroups(info: ApplicationInfo | undefined): ExtensionGroup[] {
  if (info == null) {
    return [];
  }

  return filledSections([
    { labelKey: TEXT.adminTools, items: adminToolEntries(info.adminTools) },
    { labelKey: TEXT.widgets, items: widgetEntries(info.adminExtensions) },
    { labelKey: TEXT.apis, items: apiEntries(info.apis) },
  ]);
}
