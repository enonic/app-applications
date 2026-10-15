import { cn } from '@enonic/ui';
import type { ReactNode } from 'react';

export type ItemLabelProps = {
  primary: ReactNode;
  secondary?: ReactNode;
  icon?: ReactNode;
  className?: string;
  'data-component'?: string;
};

const ITEM_LABEL_NAME = 'ItemLabel';

export function ItemLabel({
  primary,
  secondary,
  icon,
  className,
  'data-component': componentName = ITEM_LABEL_NAME,
}: ItemLabelProps) {
  return (
    <div
      data-component={componentName}
      className={cn(
        'grid items-center gap-2.5',
        icon ? 'grid-cols-[auto_1fr]' : 'grid-cols-1',
        className,
      )}
    >
      {icon && (
        <div className="group-data-[tone=inverse]:text-alt flex min-h-6 min-w-6 shrink-0 items-center justify-center">
          {icon}
        </div>
      )}

      <div className="flex flex-col overflow-hidden text-left">
        <span className="group-data-[tone=inverse]:text-alt w-full truncate leading-5.5 font-semibold">
          {primary}
        </span>
        {secondary && (
          <small className="text-subtle group-data-[tone=inverse]:text-alt w-full truncate text-sm leading-4.5">
            {secondary}
          </small>
        )}
      </div>
    </div>
  );
}

ItemLabel.displayName = ITEM_LABEL_NAME;
