import { useEffect, useRef, useState } from 'preact/hooks';
import type { ReactNode } from 'react';

import { useI18n } from '../../i18n';
import { ConfirmGate } from './ConfirmGate';
import { ModalDialog } from './ModalDialog';

export type ConfirmValueDialogProps = {
  open: boolean;
  title: string;
  description: string;
  /** What has to be typed back before the dialog will confirm. */
  expected: string | number;
  confirmLabel?: string;
  /** What the confirmation is about, shown above the gate. */
  children?: ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
};

export function ConfirmValueDialog({
  open,
  title,
  description,
  expected,
  confirmLabel,
  children,
  onClose,
  onConfirm,
}: ConfirmValueDialogProps) {
  const defaultConfirmLabel = useI18n('browse.dialog.confirm');
  const cancelLabel = useI18n('browse.dialog.cancel');
  const closeLabel = useI18n('browse.dialog.close');

  const [matched, setMatched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  // `Dialog.Content` unmounts on close, so this is the half of the state that outlives the gate.
  useEffect(() => {
    if (!open) {
      setMatched(false);
    }
  }, [open]);

  useEffect(() => {
    if (matched) {
      primaryRef.current?.focus();
    }
  }, [matched]);

  return (
    <ModalDialog
      open={open}
      title={title}
      description={description}
      size="medium"
      primaryLabel={confirmLabel ?? defaultConfirmLabel}
      primaryDisabled={!matched}
      primaryRef={primaryRef}
      intent="danger"
      cancelLabel={cancelLabel}
      closeLabel={closeLabel}
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        inputRef.current?.focus();
      }}
      onClose={onClose}
      onPrimary={onConfirm}
    >
      {children}

      <ConfirmGate
        expected={expected}
        onMatchChange={setMatched}
        confirmLabel={confirmLabel ?? defaultConfirmLabel}
        inputRef={inputRef}
      />
    </ModalDialog>
  );
}
