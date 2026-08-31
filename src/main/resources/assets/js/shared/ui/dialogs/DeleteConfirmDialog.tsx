import type { ReactNode } from 'react';

import { useI18n } from '../../i18n';
import { ConfirmDialog } from './ConfirmDialog';

export type DeleteTarget = {
  key: string;
  /** How the item reads elsewhere in the app: the caller renders it, so the dialog knows no domain. */
  label: ReactNode;
};

export type DeleteConfirmDialogProps = {
  open: boolean;
  targets: readonly DeleteTarget[];
  confirmDisabled?: boolean;
  onClose: () => void;
  onConfirm?: () => void;
};

export function DeleteConfirmDialog({
  open,
  targets,
  confirmDisabled,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const question = useI18n(
    targets.length === 1
      ? 'browse.confirm.deleteQuestion'
      : 'browse.confirm.deleteQuestionMultiple',
  );

  return (
    <ConfirmDialog
      open={open}
      question={question}
      confirmDisabled={confirmDisabled}
      onClose={onClose}
      onConfirm={onConfirm}
    >
      <ul className="flex flex-col gap-2.5 py-1.5">
        {targets.map(({ key, label }) => (
          <li key={key}>{label}</li>
        ))}
      </ul>
    </ConfirmDialog>
  );
}
