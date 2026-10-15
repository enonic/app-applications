/**
 * The admin tool descriptors no XP JS lib exposes.
 *
 * `lib/xp/admin` builds urls for a tool you already know about; enumerating what an application
 * contributes needs `AdminToolDescriptorService`, an OSGi service.
 */

export type AdminToolDescriptor = {
  key: string;
  title?: string;
  titleI18nKey?: string;
  description?: string;
  descriptionI18nKey?: string;
};

export type ListAdminToolsParams = {
  application: string;
};

type ListAdminToolsHandler = {
  setApplication(value: string): void;
  execute(): AdminToolDescriptor[];
};

export function listAdminTools(params: ListAdminToolsParams): AdminToolDescriptor[] {
  const bean = __.newBean<ListAdminToolsHandler>(
    'com.enonic.xp.app.applications.lib.admintool.ListAdminToolsHandler',
  );
  bean.setApplication(params.application);
  return __.toNativeObject(bean.execute());
}
