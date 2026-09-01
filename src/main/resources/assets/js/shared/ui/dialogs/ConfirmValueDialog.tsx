import { useEffect, useRef, useState } from 'preact/hooks';

import { useI18n } from '../../i18n';
import { ConfirmGate } from './ConfirmGate';
import { ModalDialog } from './ModalDialog';

export type ConfirmValueDialogProps = {
  open: boolean;
  title: string;
  description: string;
  /** What has to be typed back before the dialog will confirm. */
  expected: string | number;
  /** Defaults to the shared Confirm label. */
  confirmLabel?: string;
  onClose: () => void;
  onConfirm?: () => void;
};

/**
 * A confirmation that waits for the operator to type a value back. What it says is the caller's; the
 * gate, the disabled button and the focus are not.
 */
export function ConfirmValueDialog({
  open,
  title,
  description,
  expected,
  confirmLabel,
  onClose,
  onConfirm,
}: ConfirmValueDialogProps) {
  const defaultConfirmLabel = useI18n('browse.confirm.confirm');
  const cancelLabel = useI18n('browse.dialog.cancel');
  const closeLabel = useI18n('browse.dialog.close');

  const [matched, setMatched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  // `Dialog.Content` unmounts on close, so the gate forgets what was typed on its own — this is the
  // half of the state that outlives it.
  useEffect(() => {
    if (!open) {
      setMatched(false);
    }
  }, [open]);

  // The entry is done with, so the focus follows it to the button it just enabled.
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
      // The field, not the dialog box: it is what the operator has to fill in.
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        inputRef.current?.focus();
      }}
      onClose={onClose}
      onPrimary={onConfirm}
    >
      <ConfirmGate
        expected={expected}
        onMatchChange={setMatched}
        confirmLabel={confirmLabel ?? defaultConfirmLabel}
        inputRef={inputRef}
      />
    </ModalDialog>
  );
}
