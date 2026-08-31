import { ContextMenu } from '@enonic/ui';
import type { ReactNode } from 'react';

import type { ActionContext, LabelledAction } from '../browse-toolbar/actions';

export type BrowseListContextMenuProps<T> = {
  /** The section's toolbar actions — the row menu never gets a list of its own. */
  actions: readonly LabelledAction<T>[];
  context: ActionContext<T>;
  children: ReactNode;
};

export function BrowseListContextMenu<T>({
  actions,
  context,
  children,
}: BrowseListContextMenuProps<T>) {
  if (actions.length === 0) {
    return <>{children}</>;
  }

  return (
    <ContextMenu>
      <ContextMenu.Trigger className="flex min-h-0 flex-1 flex-col">{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content className="min-w-36">
          {actions.map((action) => (
            <ContextMenu.Item
              key={action.id}
              disabled={!action.enabled(context)}
              onSelect={() => void action.run(context)}
            >
              {action.label}
            </ContextMenu.Item>
          ))}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu>
  );
}
