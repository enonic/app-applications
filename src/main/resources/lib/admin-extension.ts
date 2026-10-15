/**
 * The admin extension descriptors no XP JS lib exposes — what 7.x called widgets.
 *
 * Only `AdminExtensionDescriptorService` knows them, so this is a bean like `/lib/macro`.
 */

export type AdminExtensionDescriptor = {
  key: string;
  title?: string;
  titleI18nKey?: string;
  description?: string;
  descriptionI18nKey?: string;
  /** The admin interfaces the extension plugs into. Absent rather than empty when it declares none. */
  interfaces?: string[];
};

export type ListAdminExtensionsParams = {
  application: string;
};

type ListAdminExtensionsHandler = {
  setApplication(value: string): void;
  execute(): AdminExtensionDescriptor[];
};

export function listAdminExtensions(params: ListAdminExtensionsParams): AdminExtensionDescriptor[] {
  const bean = __.newBean<ListAdminExtensionsHandler>(
    'com.enonic.xp.app.applications.lib.adminextension.ListAdminExtensionsHandler',
  );
  bean.setApplication(params.application);
  return __.toNativeObject(bean.execute());
}
