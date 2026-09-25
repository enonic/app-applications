import { Button, Menu } from '@enonic/ui';
import { ArrowDownUp, ArrowDownWideNarrow, ArrowUpWideNarrow } from 'lucide-react';

import { useI18n } from '../../shared/i18n';
import type { SortDirection } from './browse-sort';
import { HEADER_CONTROL_CLASS, HEADER_CONTROL_LABEL_CLASS } from './header-controls';

export type BrowseSortOption<Id extends string = string> = {
  id: Id;
  /** The menu item, and the trigger's tooltip while this order holds. */
  label: string;
  /** What the order is by, shown on the trigger beside the direction's icon. */
  field: string;
  direction: SortDirection;
};

export type BrowseSortProps<Id extends string = string> = {
  options: readonly BrowseSortOption<Id>[];
  value: Id;
  onChange: (id: Id) => void;
  /**
   * The order the section starts in. The control is lit while `value` is anything else, so a list the
   * user has reordered says so with the menu closed. Omitted, it never lights.
   */
  defaultValue?: Id;
};

/**
 * The `Sort by` control: one order out of the few a section offers. Section-agnostic — an option
 * is an id and a label, and what it orders by is the page's business. The id type travels through so
 * a section keeps its own union instead of casting a bare string back.
 */
export function BrowseSort<Id extends string = string>({
  options,
  value,
  onChange,
  defaultValue,
}: BrowseSortProps<Id>) {
  const sortLabel = useI18n('browse.sort');

  // The default is this control's "nothing ticked": lighting it on every visit would say nothing.
  const active = defaultValue !== undefined && value !== defaultValue;

  const current = options.find(({ id }) => id === value);
  const icon =
    current === undefined
      ? ArrowDownUp
      : current.direction === 'desc'
        ? ArrowUpWideNarrow
        : ArrowDownWideNarrow;

  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button
          variant="text"
          endIcon={icon}
          title={current?.label ?? sortLabel}
          className={HEADER_CONTROL_CLASS}
          // Spread only when set, for the reason `BrowseFilter` gives.
          {...(active ? { 'data-active': 'true' } : {})}
        >
          <span className={HEADER_CONTROL_LABEL_CLASS}>{current?.field ?? sortLabel}</span>
        </Button>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content align="end" className="min-w-56">
          {/* Picking an order is terminal, so the menu closes — unlike the multi-select filter. */}
          <Menu.RadioGroup
            value={value}
            // The library hands the value back as a bare string; matching it against the options
            // recovers the section's own union without asserting a type.
            onValueChange={(next) => {
              const picked = options.find(({ id }) => id === next);
              if (picked !== undefined) {
                onChange(picked.id);
              }
            }}
            closeOnSelect
          >
            {options.map(({ id, label }) => (
              <Menu.RadioItem key={id} value={id}>
                {label}
              </Menu.RadioItem>
            ))}
          </Menu.RadioGroup>
        </Menu.Content>
      </Menu.Portal>
    </Menu>
  );
}
