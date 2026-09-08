import { Checkbox, cn, TreeList } from '@enonic/ui';

import { ItemLabel } from '../../shared/ui/ItemLabel';
import type { BrowseRow } from './browse-list';

export type BrowseListRowProps = {
  row: BrowseRow;
  /** Ticked in the list. */
  selected: boolean;
  /** Painted as selected: ticked, or active while nothing is ticked. */
  highlighted: boolean;
  /** Absent leaves the row without a checkbox at all. */
  onSelectedChange?: (key: string, checked: boolean) => void;
  onClick: (key: string) => void;
  /** Right-click retargets the row before the context menu around the list opens. */
  onContextMenu: (key: string) => void;
};

// Row geometry follows Content Studio's content tree rows; the focus ring is `TreeList`'s own.
const ROW_CLASS = 'min-h-12';

const META_CLASS =
  'text-subtle group-data-[tone=inverse]:text-alt text-right text-sm whitespace-nowrap';
const META_COLUMN_CLASS = 'min-w-28';
const META_LAST_COLUMN_CLASS = 'min-w-20';

export function BrowseListRow({
  row,
  selected,
  highlighted,
  onSelectedChange,
  onClick,
  onContextMenu,
}: BrowseListRowProps) {
  const { key, title, subtitle, icon, meta, disabled, dimmed, selectable } = row;

  return (
    // ! `onClick` and `data-tone` replace `TreeList.Row`'s own: its click never drops the ticks, and it
    // ! paints only the ticked rows. The checkbox is ours too: `RowSelectionControl` labels itself in English.
    <TreeList.Row
      id={key}
      disabled={disabled}
      selectable={selectable !== false}
      data-tone={highlighted ? 'inverse' : undefined}
      onClick={() => onClick(key)}
      onContextMenu={() => onContextMenu(key)}
      className={cn(
        ROW_CLASS,
        highlighted && 'bg-surface-selected text-alt hover:bg-surface-selected-hover',
        dimmed && !highlighted && 'opacity-50',
      )}
    >
      {onSelectedChange !== undefined && (
        <TreeList.RowLeft>
          {disabled ? (
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
          )}
        </TreeList.RowLeft>
      )}

      <TreeList.RowContent>
        <ItemLabel icon={icon} primary={title} secondary={subtitle} />
      </TreeList.RowContent>

      {meta && meta.length > 0 && (
        <TreeList.RowRight className="shrink-0 gap-5">
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
        </TreeList.RowRight>
      )}
    </TreeList.Row>
  );
}
