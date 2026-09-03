import { cn, Input } from '@enonic/ui';
import { useEffect, useState } from 'preact/hooks';
import type { Ref } from 'react';

import { useI18n } from '../../i18n';
import { matchesExpected } from './confirm-gate';

export type ConfirmGateProps = {
  expected: string | number;
  onMatchChange: (matched: boolean) => void;
  confirmLabel?: string;
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
};

const ERROR_DELAY_MS = 500;

export function ConfirmGate({
  expected,
  onMatchChange,
  confirmLabel,
  inputRef,
  className,
}: ConfirmGateProps) {
  const defaultConfirmLabel = useI18n('browse.dialog.confirm');
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

  // ! Held back half a second: a wrong entry is what a right one looks like halfway through.
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
        readOnly={matched}
        className="w-3/5 max-w-sm"
        onInput={({ currentTarget }) => setTyped(currentTarget.value)}
      />
    </div>
  );
}
