import { Button, Menu } from '@enonic/ui';
import { ArrowDownUp } from 'lucide-react';

import { useI18n } from '../../shared/i18n';
import { HEADER_CONTROL_CLASS, HEADER_CONTROL_LABEL_CLASS } from './header-controls';

export type BrowseSortOption<Id extends string = string> = {
  id: Id;
  label: string;
};

export type BrowseSortProps<Id extends string = string> = {
  options: readonly BrowseSortOption<Id>[];
  value: Id;
  onChange: (id: Id) => void;
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
}: BrowseSortProps<Id>) {
  const sortLabel = useI18n('browse.sort');

  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button
          variant="text"
          startIcon={ArrowDownUp}
          title={sortLabel}
          className={HEADER_CONTROL_CLASS}
        >
          <span className={HEADER_CONTROL_LABEL_CLASS}>{sortLabel}</span>
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
