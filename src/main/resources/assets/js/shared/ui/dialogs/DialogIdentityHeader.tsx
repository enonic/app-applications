import type { ReactNode } from 'react';

export type DialogIdentityHeaderProps = {
  icon: ReactNode;
  value: string;
  placeholder: string;
  label: string;
  error?: string;
  onInput: (value: string) => void;
};

export function DialogIdentityHeader({
  icon,
  value,
  placeholder,
  label,
  error,
  onInput,
}: DialogIdentityHeaderProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex min-w-0 items-center gap-4">
        <span className="text-main flex size-11 shrink-0 items-center justify-center">{icon}</span>

        <span className="bg-bdr-subtle h-10 w-px shrink-0" aria-hidden />

        <input
          type="text"
          aria-label={label}
          value={value}
          placeholder={placeholder}
          onInput={({ currentTarget }) => onInput(currentTarget.value)}
          className="text-main placeholder:text-subtle min-w-0 flex-1 bg-transparent text-2xl font-semibold outline-none"
        />
      </div>

      {error !== undefined && <p className="text-error pl-15 text-sm">{error}</p>}
    </div>
  );
}
