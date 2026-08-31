import { Checkbox, cn } from '@enonic/ui';
import { useEffect, useRef } from 'preact/hooks';

import { ItemLabel } from '../../shared/ui/ItemLabel';
import type { BrowseRow } from './browse-list';

export type BrowseListRowProps = {
  row: BrowseRow;
  /** Ticked in the list. */
  selected: boolean;
  /** The row the keyboard cursor is on — it keeps the roving focus and the list's one tab stop. */
  focused: boolean;
  /** Painted as selected: ticked, or active while nothing is ticked. */
  highlighted: boolean;
  /** Absent leaves the row without a checkbox at all. */
  onSelectedChange?: (key: string, checked: boolean) => void;
  onClick: (key: string) => void;
  /** Double-click runs the section's row action, if it declared one. */
  onActivate: (key: string) => void;
  /** Right-click retargets the row before the context menu around the list opens. */
  onContextMenu: (key: string) => void;
};

// Row geometry and states follow Content Studio's content tree rows.
const ROW_CLASS =
  'group focus-visible:ring-ring relative flex min-h-12 items-center gap-2.5 px-2.5 py-1 ' +
  'outline-none focus-visible:ring-2 focus-visible:ring-inset';

const META_CLASS =
  'text-subtle group-data-[tone=inverse]:text-alt text-right text-sm whitespace-nowrap';
const META_COLUMN_CLASS = 'min-w-28';
const META_LAST_COLUMN_CLASS = 'min-w-20';

export function BrowseListRow({
  row,
  selected,
  focused,
  highlighted,
  onSelectedChange,
  onClick,
  onActivate,
  onContextMenu,
}: BrowseListRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const { key, title, subtitle, icon, meta, disabled, dimmed, selectable } = row;

  useEffect(() => {
    const row = rowRef.current;
    if (!focused || !row || document.activeElement === row) {
      return;
    }

    // ! Only while the focus is already in the list: the active row comes and goes as a query filters it
    // ! in and out, and it must not yank the focus out of the search field it came back under.
    // ! `focusVisible` keeps the ring across keyboard moves, which a plain `focus()` drops.
    if (row.closest('[role="listbox"]')?.contains(document.activeElement) === true) {
      row.focus({ focusVisible: true });
    }
  }, [focused]);

  return (
    <div
      ref={rowRef}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      data-tone={highlighted ? 'inverse' : undefined}
      tabIndex={focused ? 0 : -1}
      onClick={() => onClick(key)}
      onDblClick={() => onActivate(key)}
      onContextMenu={() => onContextMenu(key)}
      className={cn(
        ROW_CLASS,
        highlighted
          ? 'bg-surface-selected text-alt hover:bg-surface-selected-hover'
          : 'hover:bg-surface-neutral-hover',
        disabled ? 'pointer-events-none opacity-50' : 'cursor-pointer',
        dimmed && !highlighted && 'opacity-50',
      )}
    >
      {onSelectedChange !== undefined &&
        (disabled ? (
          <span className="size-4 shrink-0" aria-hidden />
        ) : (
          <Checkbox
            checked={selected}
            // Greyed in place rather than left out: the row is an item, it is just not one to act on.
            disabled={selectable === false}
            aria-label={title}
            // ! Not in the tab order: the row owns focus, and Space on the row ticks it.
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
            onCheckedChange={(checked) => onSelectedChange(key, checked === true)}
          />
        ))}

      <ItemLabel className="min-w-0 flex-1" icon={icon} primary={title} secondary={subtitle} />

      {meta && meta.length > 0 && (
        <div className="flex shrink-0 items-center gap-5">
          {meta.map((cell, index) => (
            <span
              key={index}
              className={cn(
                META_CLASS,
                index < meta.length - 1 ? META_COLUMN_CLASS : META_LAST_COLUMN_CLASS,
              )}
            >
              {cell}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
