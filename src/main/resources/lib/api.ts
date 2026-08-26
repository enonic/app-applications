/**
 * The api descriptors no XP JS lib exposes.
 *
 * `ApiDescriptorService` is the only source, so this is a bean like `/lib/macro`.
 */

export type ApiDescriptor = {
  key: string;
  title?: string;
  titleI18nKey?: string;
  description?: string;
  descriptionI18nKey?: string;
  documentationUrl?: string;
};

export type ListApisParams = {
  application: string;
};

type ListApisHandler = {
  setApplication(value: string): void;
  execute(): ApiDescriptor[];
};

export function listApis(params: ListApisParams): ApiDescriptor[] {
  const bean = __.newBean<ListApisHandler>(
    'com.enonic.xp.app.applications.lib.api.ListApisHandler',
  );
  bean.setApplication(params.application);
  return __.toNativeObject(bean.execute());
}
