import { cn } from '@enonic/ui';

export type MoreButtonProps = {
  label: string;
  /** Something is on its way: no hover, though it stays focusable — `disabled` would blur it. */
  busy?: boolean;
  onClick: () => void;
  'data-component'?: string;
};

const MORE_BUTTON_NAME = 'MoreButton';

/** A `+N more` that reads like the text it replaces until hovered: no fill and no padding, so it lines up. */
export function MoreButton({
  label,
  busy,
  onClick,
  'data-component': componentName = MORE_BUTTON_NAME,
}: MoreButtonProps) {
  return (
    <button
      data-component={componentName}
      type="button"
      aria-busy={busy}
      className={cn(
        'text-subtle transition-highlight focus-visible:ring-ring focus-visible:ring-offset-ring-offset self-start rounded-sm text-sm underline-offset-3 focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:outline-none',
        busy === true ? 'cursor-default' : 'hover:text-main cursor-pointer hover:underline',
      )}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

MoreButton.displayName = MORE_BUTTON_NAME;
