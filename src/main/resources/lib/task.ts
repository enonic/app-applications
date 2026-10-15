/**
 * The task descriptors `lib/xp/task` does not expose — that lib is about running instances. What an
 * application *declares* is reachable only through the OSGi `TaskDescriptorService`, hence the bean;
 * shaped after `lib/xp/schema`'s `listComponents`, like `/lib/macro`.
 */

export type TaskDescriptor = {
  key: string;
  description?: string;
  descriptionI18nKey?: string;
};

export type ListTaskDescriptorsParams = {
  application: string;
};

type ListTaskDescriptorsHandler = {
  setApplication(value: string): void;
  execute(): TaskDescriptor[];
};

export function listTaskDescriptors(params: ListTaskDescriptorsParams): TaskDescriptor[] {
  const bean = __.newBean<ListTaskDescriptorsHandler>(
    'com.enonic.xp.app.applications.lib.task.ListTaskDescriptorsHandler',
  );
  bean.setApplication(params.application);
  return __.toNativeObject(bean.execute());
}
