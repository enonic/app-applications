import { cn, Tooltip } from '@enonic/ui';
import type { LucideIcon } from 'lucide-react';

export type IconBadgeSize = 'sm' | 'md' | 'lg';

export type IconBadgeProps = {
  icon: LucideIcon;
  /** Any CSS color. `var(--color-…)` follows the theme, a hex does not. Transparent when absent. */
  color?: string;
  size?: IconBadgeSize;
  /** Names the badge and fills its tooltip. Decorative and silent without one. */
  label?: string;
  /** Where the caller puts it: the badge does not know it is a corner overlay. */
  className?: string;
};

const BOX = { sm: 'size-3.5', md: 'size-4.5', lg: 'size-5.5' } as const;
const GLYPH = { sm: 10, md: 12, lg: 14 } as const;
const TOOLTIP_DELAY = 300;

export function IconBadge({ icon: Icon, color, size = 'md', label, className }: IconBadgeProps) {
  const badge = (
    <span
      role={label == null ? undefined : 'img'}
      aria-label={label}
      aria-hidden={label == null}
      className={cn(
        'text-rev inline-flex items-center justify-center rounded-full',
        BOX[size],
        className,
      )}
      style={color == null ? undefined : { backgroundColor: color }}
    >
      <Icon size={GLYPH[size]} strokeWidth={2} aria-hidden />
    </span>
  );

  if (label == null) {
    return badge;
  }

  // The tooltip describes the badge and `aria-label` names it — the label is what a screen reader reads
  // either way, since the tooltip only appears on hover. ! `asChild` is load-bearing: without it the
  // trigger is a `div` with `role="button"` and `tabIndex={0}`, a second tab stop inside a browse row.
  return (
    <Tooltip value={label} side="top" delay={TOOLTIP_DELAY} asChild>
      {badge}
    </Tooltip>
  );
}
