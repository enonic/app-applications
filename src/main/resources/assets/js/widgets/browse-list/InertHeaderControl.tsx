import { Button } from '@enonic/ui';
import type { LucideIcon } from 'lucide-react';

import { HEADER_CONTROL_CLASS, HEADER_CONTROL_LABEL_CLASS } from './header-controls';

export type InertHeaderControlProps = {
  icon: LucideIcon;
  label: string;
};

export function InertHeaderControl({ icon, label }: InertHeaderControlProps) {
  return (
    // ! The wrapper is what carries the tooltip: `disabled` brings pointer-events-none, so the
    // ! button itself is never hovered and its own title would never show.
    <span title={label}>
      <Button
        variant="text"
        startIcon={icon}
        aria-label={label}
        disabled
        className={HEADER_CONTROL_CLASS}
      >
        <span className={HEADER_CONTROL_LABEL_CLASS}>{label}</span>
      </Button>
    </span>
  );
}
