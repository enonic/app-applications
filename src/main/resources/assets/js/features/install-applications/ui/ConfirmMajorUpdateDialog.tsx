import { DialogPreset } from '@enonic/ui-kit';
import { useStore } from '@nanostores/preact';

import { useHostFrame } from '../../../shared/host';
import { runMarketInstall } from '../model/install-market-application';
import { $updateConfirmTarget, closeUpdateConfirm } from '../model/update-dialog.store';
import { useMajorUpdateQuestion } from './useMajorUpdateQuestion';

export type ConfirmMajorUpdateDialogProps = {
  'data-component'?: string;
};

const CONFIRM_MAJOR_UPDATE_DIALOG_NAME = 'ConfirmMajorUpdateDialog';

/**
 * The major-version question as a dialog of its own, for an update started from a details panel
 * rather than from the install dialog. The wording is `useMajorUpdateQuestion`, which the install
 * dialog's own view asks as well; this only supplies the dialog around it.
 */
export function ConfirmMajorUpdateDialog({
  'data-component': componentName = CONFIRM_MAJOR_UPDATE_DIALOG_NAME,
}: ConfirmMajorUpdateDialogProps) {
  const row = useStore($updateConfirmTarget);
  const { notify } = useHostFrame();
  const { title, description, confirmLabel } = useMajorUpdateQuestion(row);

  if (row == null) {
    return null;
  }

  const handleConfirm = (): void => {
    closeUpdateConfirm();
    void runMarketInstall(row, notify);
  };

  return (
    <DialogPreset.Confirm
      data-component={componentName}
      open
      onOpenChange={(next) => {
        if (!next) {
          closeUpdateConfirm();
        }
      }}
      size="medium"
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      onConfirm={handleConfirm}
    />
  );
}

ConfirmMajorUpdateDialog.displayName = CONFIRM_MAJOR_UPDATE_DIALOG_NAME;
