import { Button, FilledSquareCheck, Menu } from '@enonic/ui';
import { Circle, CircleDot, Filter, Square } from 'lucide-react';

import { useI18n } from '../../shared/i18n';
import type { BrowseFilterEntry } from './browse-filter';
import { HEADER_CONTROL_CLASS, HEADER_CONTROL_LABEL_CLASS } from './header-controls';
import { InertHeaderControl } from './InertHeaderControl';

export type BrowseFilterProps = {
  entries: readonly BrowseFilterEntry[];
  selected: ReadonlySet<string>;
  onToggle: (id: string) => void;
  /**
   * How many entries may hold at once. `multiple` is the default; `single` is for a section whose server
   * takes one value. ! It changes what the row *is*: a radio announces "one of these" where a checkbox
   * announces "any of these", and a user told they may tick several would find the first silently unticked.
   */
  mode?: 'single' | 'multiple';
  /** Shown under the entries when some of them could not be loaded, so a short list reads as such. */
  notice?: string;
};

/**
 * The `Filter list` control: the entries a section supplies, each optionally counted. Section-agnostic by
 * construction — an entry is a label and maybe a number, and what it stands for is the page's business.
 */
export function BrowseFilter({
  entries,
  selected,
  onToggle,
  mode = 'multiple',
  notice,
}: BrowseFilterProps) {
  const filterLabel = useI18n('browse.filter');

  if (entries.length === 0 && notice === undefined) {
    return <InertHeaderControl icon={Filter} label={filterLabel} />;
  }

  return (
    <Menu>
      <Menu.Trigger asChild>
        <Button
          variant="text"
          startIcon={Filter}
          title={filterLabel}
          className={HEADER_CONTROL_CLASS}
        >
          <span className={HEADER_CONTROL_LABEL_CLASS}>{filterLabel}</span>
        </Button>
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content align="end" className="min-w-56">
          {entries.map(({ id, label, count }) => {
            const ticked = selected.has(id);
            const Indicator = indicatorFor(mode, ticked);

            return (
              <Menu.Item
                key={id}
                // The row itself is the control, so it carries the state its indicator draws.
                role={mode === 'single' ? 'menuitemradio' : 'menuitemcheckbox'}
                aria-checked={ticked}
                /*
                 * ! `Menu.Item` closes the menu unless the select event is cancelled, and the mode decides
                 * ! which is right: a multi-select must survive several ticks, so it cancels; a single pick
                 * ! is terminal, so it lets the menu close, as a radio leads a user to expect.
                 */
                onSelect={(event) => {
                  if (mode === 'multiple') {
                    event.preventDefault();
                  }
                  onToggle(id);
                }}
              >
                <span className="flex w-full items-center gap-2">
                  {/* ! The indicator is drawn, not composed: `Checkbox` renders `readOnly` as `disabled`
                      ! plus `opacity-30`, so every entry would read as unavailable, and its label
                      ! wraps an input whose click would reach `onSelect` a second time. */}
                  <Indicator className="text-main size-4 shrink-0 rounded-sm" aria-hidden />
                  <span className="grow truncate">{label}</span>
                  {/* Absent where the section narrows on the server and per-entry counts are unknowable. */}
                  {count !== undefined && <span className="text-subtle tabular-nums">{count}</span>}
                </span>
              </Menu.Item>
            );
          })}
          {notice !== undefined && <Menu.Label className="text-subtle">{notice}</Menu.Label>}
        </Menu.Content>
      </Menu.Portal>
    </Menu>
  );
}

function indicatorFor(mode: 'single' | 'multiple', ticked: boolean) {
  if (mode === 'single') {
    return ticked ? CircleDot : Circle;
  }

  return ticked ? FilledSquareCheck : Square;
}
