import { ActionDialog, DeleteConfirm, type DeleteTarget } from '@enonic/ui-kit';
import { useStore } from '@nanostores/preact';

import { uninstallApplications } from '../../../entities/application';
import { useHostFrame } from '../../../shared/host';
import { useI18n } from '../../../shared/i18n';
import { $uninstallTargets, closeUninstallDialog } from '../model/uninstall-dialog.store';

export type UninstallApplicationsDialogProps = {
  'data-component'?: string;
};

const UNINSTALL_APPLICATIONS_DIALOG_NAME = 'UninstallApplicationsDialog';

/**
 * Confirms an uninstall before it happens, and closes as it starts: the outcome is a toast per
 * application through this mount's frame, so there is nothing for the dialog to wait for. One
 * application is a click away; several have their count typed back first.
 */
export function UninstallApplicationsDialog({
  'data-component': componentName = UNINSTALL_APPLICATIONS_DIALOG_NAME,
}: UninstallApplicationsDialogProps) {
  const targets = useStore($uninstallTargets);
  const { notify } = useHostFrame();

  const count = targets?.length ?? 0;
  const title = useI18n('applications.dialog.uninstall.title');
  const confirmLabel = useI18n('applications.action.uninstall');
  const questionSingle = useI18n(
    'applications.dialog.uninstall.question',
    targets?.[0]?.displayName ?? '',
  );
  const questionMultiple = useI18n('applications.dialog.uninstall.questionMultiple', count);

  const deleteTargets: DeleteTarget[] = (targets ?? []).map((application) => ({
    key: application.key,
    name: application.key,
    label: application.displayName,
  }));

  const handleConfirm = (): void => {
    closeUninstallDialog();

    if (targets !== undefined) {
      void uninstallApplications(targets, notify);
    }
  };

  return (
    <ActionDialog.Root
      open={targets !== undefined}
      onOpenChange={(next) => {
        if (!next) {
          closeUninstallDialog();
        }
      }}
    >
      <ActionDialog.Portal>
        <ActionDialog.Overlay />
        <DeleteConfirm
          data-component={componentName}
          title={title}
          question={count > 1 ? questionMultiple : questionSingle}
          targets={deleteTargets}
          expected={count > 1 ? count : null}
          confirmLabel={confirmLabel}
          onConfirm={handleConfirm}
        />
      </ActionDialog.Portal>
    </ActionDialog.Root>
  );
}

UninstallApplicationsDialog.displayName = UNINSTALL_APPLICATIONS_DIALOG_NAME;
