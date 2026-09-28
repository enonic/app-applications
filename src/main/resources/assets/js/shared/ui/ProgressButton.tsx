import { Button, type ButtonProps, cn } from '@enonic/ui';

import { clampProgress } from './progress';

export type ProgressButtonProps = { progress?: number; 'data-component'?: string } & ButtonProps;

const PROGRESS_BUTTON_NAME = 'ProgressButton';

/**
 * A button that fills with its own progress while the work it started runs, and refuses a second
 * press until that finishes.
 */
export function ProgressButton({
  progress,
  className,
  'data-component': componentName = PROGRESS_BUTTON_NAME,
  ...props
}: ProgressButtonProps) {
  if (progress == null) {
    return <Button data-component={componentName} className={className} {...props} />;
  }

  return (
    <Button
      data-component={componentName}
      {...props}
      disabled
      aria-busy
      className={cn('relative', className)}
    >
      <span
        className="bg-success-rev absolute inset-y-0 left-0 animate-pulse transition-[width] duration-300 ease-out"
        style={{ width: `${clampProgress(progress)}%` }}
        aria-hidden
      />
    </Button>
  );
}

ProgressButton.displayName = PROGRESS_BUTTON_NAME;
