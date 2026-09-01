import type { ReactNode } from 'react';

import { useI18n } from '../../i18n';
import { ModalDialog } from './ModalDialog';

export type ConfirmDialogProps = {
  open: boolean;
  question: string;
  confirmDisabled?: boolean;
  error?: string;
  children?: ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
};

export function ConfirmDialog({
  open,
  question,
  confirmDisabled,
  error,
  children,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const title = useI18n('browse.confirm.title');
  const confirmLabel = useI18n('browse.dialog.confirm');
  const cancelLabel = useI18n('browse.dialog.cancel');
  const closeLabel = useI18n('browse.dialog.close');

  return (
    <ModalDialog
      open={open}
      title={title}
      primaryLabel={confirmLabel}
      primaryDisabled={confirmDisabled}
      cancelLabel={cancelLabel}
      cancelVariant="outline"
      error={error}
      closeLabel={closeLabel}
      onClose={onClose}
      onPrimary={onConfirm}
    >
      <div className="flex flex-col gap-2.5">
        <p className="text-main text-base">{question}</p>
        {children}
      </div>
    </ModalDialog>
  );
}
