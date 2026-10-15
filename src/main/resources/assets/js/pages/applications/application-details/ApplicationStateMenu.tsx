import { Button, Menu } from '@enonic/ui';
import { ChevronDown } from 'lucide-react';

import {
  type Application,
  startApplications,
  stopApplications,
} from '../../../entities/application';
import { isManagedMode } from '../../../shared/config';
import { useHostFrame } from '../../../shared/host';
import { useI18n } from '../../../shared/i18n';
import { isStartable, isStoppable } from '../model/application-lifecycle';
import { applicationStateLabelKey } from '../model/applications.rows';

export type ApplicationStateMenuProps = {
  application: Application;
  /** On the trigger, or on the plain label; the open menu is `<name>.Menu`, as in `BrowseFilter`. */
  'data-component'?: string;
};

const APPLICATION_STATE_MENU_NAME = 'ApplicationStateMenu';

/**
 * The application's state as a dropdown offering the opposite state. An application this section must
 * not stop — a platform one, or its own — gets a plain label instead, as does every application in
 * managed mode.
 */
export function ApplicationStateMenu({
  application,
  'data-component': componentName = APPLICATION_STATE_MENU_NAME,
}: ApplicationStateMenuProps) {
  const { notify } = useHostFrame();
  const stateLabel = useI18n(applicationStateLabelKey(application.state));

  const stoppable = isStoppable(application);
  const actionLabel = useI18n(stoppable ? 'applications.action.stop' : 'applications.action.start');

  // Managed mode offers nothing that changes what is installed.
  if (isManagedMode() || (!stoppable && !isStartable(application))) {
    return (
      <span data-component={componentName} className="text-subtle text-sm whitespace-nowrap">
        {stateLabel}
      </span>
    );
  }

  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button
          data-component={componentName}
          variant="outline"
          size="sm"
          label={stateLabel}
          endIcon={ChevronDown}
          className="w-40"
        />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content data-component={`${componentName}.Menu`} className="min-w-24">
          <Menu.Item
            onSelect={() =>
              void (stoppable
                ? stopApplications([application], notify)
                : startApplications([application], notify))
            }
          >
            {actionLabel}
          </Menu.Item>
        </Menu.Content>
      </Menu.Portal>
    </Menu>
  );
}

ApplicationStateMenu.displayName = APPLICATION_STATE_MENU_NAME;
