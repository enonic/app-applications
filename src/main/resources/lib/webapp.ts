/**
 * Whether an application ships a webapp.
 *
 * No XP JS lib can answer this: `ResourceKey.resolve()` never changes the application key, so
 * `io.getResource()` cannot see another application's files. Hence the bean.
 */

export type HasWebappParams = {
  application: string;
};

type HasWebappHandler = {
  setApplication(value: string): void;
  execute(): boolean;
};

export function hasWebapp(params: HasWebappParams): boolean {
  const bean = __.newBean<HasWebappHandler>(
    'com.enonic.xp.app.applications.lib.webapp.HasWebappHandler',
  );
  bean.setApplication(params.application);
  return bean.execute();
}
