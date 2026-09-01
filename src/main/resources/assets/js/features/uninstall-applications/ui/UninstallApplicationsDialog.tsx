import { useStore } from '@nanostores/preact';

import { uninstallApplications } from '../../../entities/application';
import { i18n, useI18n } from '../../../shared/i18n';
import { ConfirmDialog } from '../../../shared/ui/dialogs/ConfirmDialog';
import { ConfirmValueDialog } from '../../../shared/ui/dialogs/ConfirmValueDialog';
import { $uninstallTargets, closeUninstallDialog } from '../model/uninstall-dialog.store';

/**
 * Confirms an uninstall before it happens, and closes as it starts: the outcome is a toast per
 * application from the command itself, so there is nothing for the dialog to wait for.
 */
export function UninstallApplicationsDialog() {
  const targets = useStore($uninstallTargets);

  const count = targets?.length ?? 0;
  const title = useI18n('applications.dialog.uninstall.title');
  const questionMultiple = useI18n('applications.dialog.uninstall.questionMultiple', count);
  const questionSingle = i18n(
    'applications.dialog.uninstall.question',
    targets?.[0]?.displayName ?? '',
  );

  const handleConfirm = (): void => {
    closeUninstallDialog();

    if (targets !== undefined) {
      void uninstallApplications(targets);
    }
  };

  if (count > 1) {
    return (
      <ConfirmValueDialog
        open
        title={title}
        description={questionMultiple}
        expected={count}
        onClose={closeUninstallDialog}
        onConfirm={handleConfirm}
      />
    );
  }

  return (
    <ConfirmDialog
      open={targets !== undefined}
      question={questionSingle}
      onClose={closeUninstallDialog}
      onConfirm={handleConfirm}
    />
  );
}
