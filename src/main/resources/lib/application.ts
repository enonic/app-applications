/**
 * Whether an application was installed from this instance's deploy directory.
 *
 * XP refuses to uninstall such an application — `ApplicationServiceImpl.uninstallApplication` throws
 * `ApplicationBundleException` for anything in its `localApplicationSet` — and no XP JS lib exposes the
 * flag: `lib-app`'s mapper does not carry it, and `getApplicationMode` answers a different question
 * (`BUNDLED` / `VIRTUAL` / `AUGMENTED`). Hence the bean.
 */

export type IsLocalApplicationParams = {
  application: string;
};

type IsLocalApplicationHandler = {
  setApplication(value: string): void;
  execute(): boolean;
};

export function isLocalApplication(params: IsLocalApplicationParams): boolean {
  const bean = __.newBean<IsLocalApplicationHandler>(
    'com.enonic.xp.app.applications.lib.application.IsLocalApplicationHandler',
  );
  bean.setApplication(params.application);
  return bean.execute();
}
