import { Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/preact';

import { runMarketInstall } from '../model/install-market-application';
import { $updateConfirmTarget, closeUpdateConfirm } from '../model/update-dialog.store';
import { ConfirmMajorUpdate } from './ConfirmMajorUpdate';

/**
 * The major-version question as a dialog of its own, for an update started from a details panel
 * rather than from the install dialog. The question itself is `ConfirmMajorUpdate`, which the install
 * dialog shows as one of its own views, this only supplies the shell around it.
 */
export function ConfirmMajorUpdateDialog() {
  const row = useStore($updateConfirmTarget);

  if (row == null) {
    return null;
  }

  const handleConfirm = (): void => {
    closeUpdateConfirm();
    void runMarketInstall(row);
  };

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next) {
          closeUpdateConfirm();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay />

        <Dialog.Content className="max-w-160 gap-6">
          <ConfirmMajorUpdate row={row} onConfirm={handleConfirm} onCancel={closeUpdateConfirm} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
