import { Button, Checkbox } from '@enonic/ui';
import { ArrowDownUp, Filter, RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

import { useI18n } from '../../shared/i18n';
import { HEADER_CONTROL_CLASS, HEADER_CONTROL_LABEL_CLASS } from './header-controls';
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
  filter,
  sort,
}: BrowseListHeaderProps) {
  const selectAllLabel = useI18n('browse.selectAll');
  const refreshLabel = useI18n('browse.refresh');
  const filterLabel = useI18n('browse.filter');
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
        <Button
          variant="text"
          startIcon={RefreshCw}
          title={refreshLabel}
          onClick={onRefresh}
          className={HEADER_CONTROL_CLASS}
        >
          <span className={HEADER_CONTROL_LABEL_CLASS}>{refreshLabel}</span>
        </Button>
        {filter ?? <InertHeaderControl icon={Filter} label={filterLabel} />}
        {sort ?? <InertHeaderControl icon={ArrowDownUp} label={sortLabel} />}
      </div>
    </div>
  );
}
