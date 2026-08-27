/**
 * The `lib/xp/macro` XP does not ship.
 *
 * Macro descriptors are reachable only through `MacroDescriptorService`, an OSGi service — no XP
 * JS lib exposes them, which is why this app carries Java at all. Shaped after `lib/xp/schema`'s
 * `listComponents` so replacing it with a platform lib later is one import.
 */

export type MacroDescriptor = {
  key: string;
  title: string;
  titleI18nKey?: string;
  description?: string;
  descriptionI18nKey?: string;
};

export type ListMacrosParams = {
  application: string;
};

type ListMacrosHandler = {
  setApplication(value: string): void;
  execute(): MacroDescriptor[];
};

export function listMacros(params: ListMacrosParams): MacroDescriptor[] {
  const bean = __.newBean<ListMacrosHandler>(
    'com.enonic.xp.app.applications.lib.macro.ListMacrosHandler',
  );
  bean.setApplication(params.application);
  return __.toNativeObject(bean.execute());
}
