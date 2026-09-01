import { cn, Input } from '@enonic/ui';
import { useEffect, useState } from 'preact/hooks';
import type { Ref } from 'react';

import { useI18n } from '../../i18n';
import { matchesExpected } from './confirm-gate';

export type ConfirmGateProps = {
  /** What has to be typed back: a count, or any short value the operator can read off the screen. */
  expected: string | number;
  /** Fires as the entry starts and stops matching — enable the button, move the focus. */
  onMatchChange: (matched: boolean) => void;
  /** Names the button the hint sends the operator to. Defaults to the shared Confirm label. */
  confirmLabel?: string;
  /** So the caller can put the initial focus in the field. */
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
};

const ERROR_DELAY_MS = 500;

/**
 * The value an operator has to type back before an action they cannot undo. Content Studio's
 * `shared/ui/dialogs/Gate.tsx` is the same panel; it knows nothing of the dialog around it.
 */
export function ConfirmGate({
  expected,
  onMatchChange,
  confirmLabel,
  inputRef,
  className,
}: ConfirmGateProps) {
  const defaultConfirmLabel = useI18n('browse.confirm.confirm');
  const enterLabel = useI18n('browse.confirm.enterValue');
  const endingLabel = useI18n(
    'browse.confirm.enterValueEnding',
    confirmLabel ?? defaultConfirmLabel,
  );

  const [typed, setTyped] = useState('');
  const [showError, setShowError] = useState(false);

  const entered = typed.trim();
  const matched = matchesExpected(typed, expected);
  const mismatchLabel = useI18n('browse.confirm.mismatch', expected, entered);

  useEffect(() => {
    onMatchChange(matched);
  }, [matched, onMatchChange]);

  // ! Held back half a second, as Content Studio's gate does: a wrong entry is what a right one looks
  // ! like halfway through, and an error on the first keystroke would be noise.
  useEffect(() => {
    if (entered === '' || matched) {
      setShowError(false);
      return;
    }

    const timer = window.setTimeout(() => setShowError(true), ERROR_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [entered, matched]);

  return (
    <div className={cn('bg-surface-primary flex flex-col gap-2.5 rounded-lg p-7.5', className)}>
      <p className="text-xl">
        {enterLabel} <strong>{expected}</strong> {endingLabel}
      </p>

      <Input
        ref={inputRef}
        value={typed}
        inputMode={typeof expected === 'number' ? 'numeric' : undefined}
        aria-label={`${enterLabel} ${expected} ${endingLabel}`}
        error={showError ? mismatchLabel : undefined}
        // Locked once it matches: the focus has moved to the button, and the value must not drift.
        readOnly={matched}
        className="w-3/5 max-w-sm"
        onInput={({ currentTarget }) => setTyped(currentTarget.value)}
      />
    </div>
  );
}
