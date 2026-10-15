import { ActionDialog } from '@enonic/ui-kit';
import { useStore } from '@nanostores/preact';

import { $installDialogOpen, closeInstallDialog } from '../model/install-dialog.store';
import { InstallApplicationsDialogContent } from './InstallApplicationsDialogContent';

export type InstallApplicationsDialogProps = {
  /**
   * Carried down to `ActionDialog.Content`, so the dialog reads as this one and not as its content.
   */
  'data-component'?: string;
};

const INSTALL_APPLICATIONS_DIALOG_NAME = 'InstallApplicationsDialog';

/** The dialog itself: whether it is open. */
export function InstallApplicationsDialog({
  'data-component': componentName = INSTALL_APPLICATIONS_DIALOG_NAME,
}: InstallApplicationsDialogProps) {
  const open = useStore($installDialogOpen);

  if (!open) {
    return null;
  }

  return (
    <ActionDialog.Root
      open
      onOpenChange={(next) => {
        if (!next) {
          closeInstallDialog();
        }
      }}
    >
      <ActionDialog.Portal>
        <ActionDialog.Overlay />
        <InstallApplicationsDialogContent data-component={componentName} />
      </ActionDialog.Portal>
    </ActionDialog.Root>
  );
}

InstallApplicationsDialog.displayName = INSTALL_APPLICATIONS_DIALOG_NAME;
