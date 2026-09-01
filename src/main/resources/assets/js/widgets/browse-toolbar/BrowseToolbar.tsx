import { Button, Toolbar } from '@enonic/ui';

import { useI18n } from '../../shared/i18n';
import type { ActionContext, LabelledAction } from './actions';

export type BrowseToolbarProps<T> = {
  actions: readonly LabelledAction<T>[];
  context: ActionContext<T>;
};

export function BrowseToolbar<T>({ actions, context }: BrowseToolbarProps<T>) {
  const toolbarLabel = useI18n('browse.toolbar');

  return (
    <Toolbar.Root>
      <Toolbar.Container
        aria-label={toolbarLabel}
        className="bg-surface-neutral border-bdr-soft flex h-15 shrink-0 items-center gap-2 border-b px-5 py-2"
      >
        {actions.map((action) => (
          // ! disabled belongs on Toolbar.Item, not on the Button: Slot lets the child win.
          <Toolbar.Item key={action.id} asChild disabled={!action.enabled(context)}>
            <Button variant="text" label={action.label} onClick={() => void action.run(context)} />
          </Toolbar.Item>
        ))}
      </Toolbar.Container>
    </Toolbar.Root>
  );
}
