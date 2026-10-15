/**
 * A question about an *application*: is it an id provider, and what does its descriptor declare.
 */

export type IdProviderDescriptor = {
  /** Absent when the descriptor declares no `mode:`. The builder has no default. */
  mode?: string;
  /** Whether the descriptor declares a config form. The form itself is not carried. */
  hasConfig: boolean;
};

export type GetIdProviderDescriptorParams = {
  application: string;
};

type GetIdProviderDescriptorHandler = {
  setApplication(value: string): void;
  execute(): IdProviderDescriptor | null;
};

/** Null when the application ships no descriptor, i.e. when it is not an id provider at all. */
export function getIdProviderDescriptor(
  params: GetIdProviderDescriptorParams,
): IdProviderDescriptor | null {
  const bean = __.newBean<GetIdProviderDescriptorHandler>(
    'com.enonic.xp.app.applications.lib.idprovider.GetIdProviderDescriptorHandler',
  );
  bean.setApplication(params.application);
  return __.toNativeObject(bean.execute());
}
