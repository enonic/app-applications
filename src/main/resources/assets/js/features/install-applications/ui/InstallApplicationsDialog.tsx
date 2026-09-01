import { Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/preact';

import { $installDialogOpen, closeInstallDialog } from '../model/install-dialog.store';
import { InstallApplicationsDialogContent } from './InstallApplicationsDialogContent';

/**
 * The dialog itself: whether it is open.
 *
 * TODO: It also listened for the download progress of a market install, which XP publishes as
 * `PROGRESS` application events. The admin events hub excludes those deliberately — a publish per
 * percent to every subscriber is noise — so `server:app`'s SSE channel is the carrier left, and no
 * consumer for it exists yet. Until one does, a market install renders a bar stuck at 0, as it
 * already did for a download core cannot measure. Uploading a jar is unaffected: that progress is
 * the browser's own XHR, and unrelated. See app-settings `docs/extensions/docs.md` § Events.
 */
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
