import { Button, Checkbox } from '@enonic/ui';
import { ArrowDownUp, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

import { useI18n } from '../../shared/i18n';
import { InertHeaderControl } from './InertHeaderControl';

export type BrowseListHeaderProps = {
  allSelected?: boolean | 'indeterminate';
  /** Absent leaves the header without a select-all. */
  onSelectAllChange?: (checked: boolean) => void;
  onRefresh: () => void;
  /** Section-specific control. Undefined renders the button inert — see § 3.6 of the contract. */
  filter?: ReactNode;
  sort?: ReactNode;
};

export function BrowseListHeader({
  allSelected,
  onSelectAllChange,
  onRefresh,
  sort,
}: BrowseListHeaderProps) {
  const selectAllLabel = useI18n('browse.selectAll');
  const refreshLabel = useI18n('browse.refresh');
  const sortLabel = useI18n('browse.sort');

  return (
    <div className="@container flex shrink-0 flex-wrap items-center justify-between gap-2">
      {onSelectAllChange !== undefined && (
        <Checkbox
          checked={allSelected ?? false}
          label={selectAllLabel}
          onCheckedChange={(checked) => onSelectAllChange(checked === true)}
          // ? Checkbox exposes no hook for its label text, so the padding is aimed at the text
          // ? span from the label class: the box itself must not move.
          // ! my-0 drops the label's own 3px margins, or the block outgrows the h-10 buttons.
          // ? pl-2.5 is the row's own px-2.5: it puts this box over the boxes in the rows.
          className="my-0 h-10 gap-0 pl-2.5 font-semibold [&>span:last-child]:px-4.5"
        />
      )}

      <div className="ml-auto flex flex-wrap items-center gap-2.5">
        {/* TODO: remove it and its functionality when filter component lands */}
        {/* {filter ?? <InertHeaderControl icon={Filter} label={filterLabel} />} */}
        {sort ?? <InertHeaderControl icon={ArrowDownUp} label={sortLabel} />}
        <Button
          variant="text"
          startIcon={RefreshCw}
          title={refreshLabel}
          aria-label={refreshLabel}
          onClick={onRefresh}
          className="px-2.5"
        />
      </div>
    </div>
  );
}
