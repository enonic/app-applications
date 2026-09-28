import { Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/preact';

import { $installDialogOpen, closeInstallDialog } from '../model/install-dialog.store';
import { InstallApplicationsDialogContent } from './InstallApplicationsDialogContent';

export type InstallApplicationsDialogProps = {
  /** Carried down to `Dialog.Content`, so the dialog reads as this one and not as its content. */
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
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) {
          closeInstallDialog();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay />
        <InstallApplicationsDialogContent data-component={componentName} />
      </Dialog.Portal>
    </Dialog>
  );
}

InstallApplicationsDialog.displayName = INSTALL_APPLICATIONS_DIALOG_NAME;
