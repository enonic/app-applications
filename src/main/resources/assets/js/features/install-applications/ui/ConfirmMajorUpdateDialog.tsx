import { Dialog } from '@enonic/ui';
import { useStore } from '@nanostores/preact';

import { useHostFrame } from '../../../shared/host';
import { runMarketInstall } from '../model/install-market-application';
import { $updateConfirmTarget, closeUpdateConfirm } from '../model/update-dialog.store';
import { ConfirmMajorUpdate } from './ConfirmMajorUpdate';

export type ConfirmMajorUpdateDialogProps = {
  'data-component'?: string;
};

const CONFIRM_MAJOR_UPDATE_DIALOG_NAME = 'ConfirmMajorUpdateDialog';

/**
 * The major-version question as a dialog of its own, for an update started from a details panel
 * rather than from the install dialog. The question itself is `ConfirmMajorUpdate`, which the install
 * dialog shows as one of its own views, this only supplies the shell around it.
 */
export function ConfirmMajorUpdateDialog({
  'data-component': componentName = CONFIRM_MAJOR_UPDATE_DIALOG_NAME,
}: ConfirmMajorUpdateDialogProps) {
  const row = useStore($updateConfirmTarget);
  const { notify } = useHostFrame();

  if (row == null) {
    return null;
  }

  const handleConfirm = (): void => {
    closeUpdateConfirm();
    void runMarketInstall(row, notify);
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

        <Dialog.Content data-component={componentName} className="max-w-160 gap-6">
          <ConfirmMajorUpdate row={row} onConfirm={handleConfirm} onCancel={closeUpdateConfirm} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}

ConfirmMajorUpdateDialog.displayName = CONFIRM_MAJOR_UPDATE_DIALOG_NAME;
