import { Box, Laptop, Settings } from 'lucide-react';
import { useState } from 'preact/hooks';

import { i18n } from '../../../shared/i18n';
import { IconBadge } from '../../../shared/ui/IconBadge';

export type ApplicationIconProps = {
  /** The `data:` uri the schema resolves from the descriptor, or a market entry's remote `iconUrl`. */
  icon?: string;
  /** `sm` for a list row, `lg` for the details header. */
  size?: 'sm' | 'lg';
  /**
   * The application's own flags: at most one corner badge, system before local. Absent for an icon standing
   * for no installed application — a market entry, or a form placeholder.
   */
  system?: boolean;
  local?: boolean;
};

const CLASSES = { sm: 'size-6', lg: 'size-12' } as const;
const PIXELS = { sm: 24, lg: 48 } as const;

/** An application's own icon where it has one, a generic package glyph where it does not. */
export function ApplicationIcon({ icon, size = 'sm', system, local }: ApplicationIconProps) {
  // ! The failing url rather than a flag: a `data:` uri cannot fail, but a market icon is fetched
  // ! from another host and may 404, and the same element is reused as rows are filtered in and out.
  const [failedIcon, setFailedIcon] = useState<string>();

  const glyph =
    icon == null || icon === failedIcon ? (
      <Box size={PIXELS[size]} strokeWidth={1.5} aria-hidden />
    ) : (
      <img
        src={icon}
        alt=""
        className={`${CLASSES[size]} object-contain`}
        onError={() => setFailedIcon(icon)}
      />
    );

  if (!system && !local) {
    return glyph;
  }

  const badge = system
    ? { icon: Settings, color: 'var(--color-main)', label: i18n('applications.badge.system') }
    : { icon: Laptop, color: 'var(--color-info)', label: i18n('applications.badge.local') };

  return (
    <span className="relative inline-flex shrink-0">
      {glyph}

      <IconBadge
        icon={badge.icon}
        color={badge.color}
        size={size === 'lg' ? 'md' : 'sm'}
        label={badge.label}
        className="absolute -top-0.75 -right-0.75"
      />
    </span>
  );
}
