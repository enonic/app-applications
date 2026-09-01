import { cn } from '@enonic/ui';

import { clampProgress } from './progress';

export type ProgressBarProps = {
  /** 0–100. Out-of-range and non-finite values are clamped rather than refused. */
  progress: number;
  /** Whether the fill eases to its new width, or jumps. */
  animated?: boolean;
  /** What a screen reader calls it — the bar has no text of its own. */
  label?: string;
  className?: string;
};

/**
 * How far along a piece of work is. `@enonic/ui` ships no progress component.
 *
 * Content Studio v6's `shared/ui/primitives/ProgressBar.tsx` is the same component; keep the two
 * portable. The `label` is ours — it has no counterpart there yet.
 */
export function ProgressBar({ progress, animated = true, label, className }: ProgressBarProps) {
  const percent = clampProgress(progress);

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn('bg-surface-selected h-2.5 w-full overflow-hidden rounded-lg', className)}
    >
      <div
        className={cn(
          'bg-success-rev h-full rounded-l-lg',
          animated && 'transition-[width] duration-300 ease-out',
        )}
        style={{ width: `${percent}%` }}
        aria-hidden
      />
    </div>
  );
}
