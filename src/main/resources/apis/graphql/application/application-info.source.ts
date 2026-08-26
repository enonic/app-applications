import { listAdminExtensions } from '/lib/admin-extension';
import { listAdminTools } from '/lib/admin-tool';
import { listApis } from '/lib/api';
import { getIdProviderDescriptor } from '/lib/idprovider';
import { listMacros } from '/lib/macro';
import { listTaskDescriptors } from '/lib/task';
import { hasWebapp } from '/lib/webapp';
import { getToolUrl } from '/lib/xp/admin';
import { get } from '/lib/xp/app';
import { getIdProviders } from '/lib/xp/auth';
import {
  listComponents,
  listSchemas,
  type ComponentDescriptorType,
  type ContentSchemaType,
} from '/lib/xp/schema';

export type ApplicationInfoSource = {
  key: string;
};

export type ApplicationItem = {
  key: string;
  name: string;
  displayName: string;
  description?: string;
};

// The three admin-extension lists each carry one field the other eight do not.
export type AdminToolItem = ApplicationItem & { url: string };
export type AdminExtensionItem = ApplicationItem & { interfaces: string[] };
export type ApiItem = ApplicationItem & { documentationUrl?: string };

// Carries the application key so `usedBy` stays lazy, plus the mode the container already read.
export type IdProviderSource = {
  application: string;
  mode?: string;
  hasConfig: boolean;
};

export type IdProviderItem = {
  key: string;
  displayName: string;
};

export function localNameOf(qualifiedName: string): string {
  const separator = qualifiedName.indexOf(':');
  return separator === -1 ? qualifiedName : qualifiedName.slice(separator + 1);
}

export function listSchemaItems(application: string, type: ContentSchemaType): ApplicationItem[] {
  return listSchemas({ application, type })
    .map((schema) => toApplicationItem(schema.name, schema.title, schema.description))
    .sort(byDisplayName);
}

export function listComponentItems(
  application: string,
  type: ComponentDescriptorType,
): ApplicationItem[] {
  return listComponents({ application, type })
    .map((descriptor) =>
      toApplicationItem(descriptor.key, descriptor.title, descriptor.description),
    )
    .sort(byDisplayName);
}

export function listMacroItems(application: string): ApplicationItem[] {
  return listMacros({ application })
    .map((macro) => toApplicationItem(macro.key, macro.title, macro.description))
    .sort(byDisplayName);
}

// A task descriptor has no title at all, so displayName always resolves to the name.
export function listTaskItems(application: string): ApplicationItem[] {
  return listTaskDescriptors({ application })
    .map((task) => toApplicationItem(task.key, undefined, task.description))
    .sort(byDisplayName);
}

export function listAdminToolItems(application: string): AdminToolItem[] {
  return listAdminTools({ application })
    .map((tool) => {
      const item = toApplicationItem(tool.key, tool.title, tool.description);
      return { ...item, url: getToolUrl(application, item.name) };
    })
    .sort(byDisplayName);
}

export function listAdminExtensionItems(application: string): AdminExtensionItem[] {
  return listAdminExtensions({ application })
    .map((extension) => ({
      ...toApplicationItem(extension.key, extension.title, extension.description),
      interfaces: extension.interfaces ?? [],
    }))
    .sort(byDisplayName);
}

export function listApiItems(application: string): ApiItem[] {
  return listApis({ application })
    .map((api) => ({
      ...toApplicationItem(api.key, api.title, api.description),
      documentationUrl: nonEmpty(api.documentationUrl),
    }))
    .sort(byDisplayName);
}

export function deploymentUrlOf(application: string): string | null {
  return hasWebapp({ application }) ? `/webapp/${application}` : null;
}

export function idProviderSourceOf(application: string): IdProviderSource | null {
  const descriptor = getIdProviderDescriptor({ application });

  return descriptor == null
    ? null
    : { application, mode: nonEmpty(descriptor.mode), hasConfig: descriptor.hasConfig };
}

export function listUsedByItems(application: string): IdProviderItem[] {
  return getIdProviders()
    .filter((idProvider) => idProvider.idProviderConfig?.applicationKey === application)
    .map((idProvider) => ({ key: idProvider.key, displayName: idProvider.displayName }))
    .sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' }));
}

export function applicationInfoSource(key: string): ApplicationInfoSource | null {
  return get({ key }) == null ? null : { key };
}

// *
// * Helpers
// *

// ! Keep the null check. The declared type says it cannot be undefined; the runtime disagrees.
function nonEmpty(value?: string): string | undefined {
  return value != null && value.length > 0 ? value : undefined;
}

function toApplicationItem(
  qualifiedName: string,
  title?: string,
  description?: string,
): ApplicationItem {
  const name = localNameOf(qualifiedName);
  return {
    key: qualifiedName,
    name,
    // TODO: Localize through titleI18nKey once the i18n bundle of the target app is read.
    displayName: nonEmpty(title) ?? name,
    description: nonEmpty(description),
  };
}

function byDisplayName(a: ApplicationItem, b: ApplicationItem): number {
  return a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' });
}
