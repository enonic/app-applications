import { Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/preact';

import { $installDialogOpen, closeInstallDialog } from '../model/install-dialog.store';
import { InstallApplicationsDialogContent } from './InstallApplicationsDialogContent';

/** The dialog itself: whether it is open. */
export function InstallApplicationsDialog() {
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
        <InstallApplicationsDialogContent />
      </Dialog.Portal>
    </Dialog>
  );
}
