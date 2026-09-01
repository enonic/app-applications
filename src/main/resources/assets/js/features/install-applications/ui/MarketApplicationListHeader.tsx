import { cn } from '@enonic/ui';

import { useI18n } from '../../../shared/i18n';
import { MARKET_GRID_CLASS } from './market-grid';

/**
 * The column titles. Sticky inside the dialog's scroll container rather than fixed above it: a header
 * outside that container stands beside the scrollbar and its columns miss the rows by its width.
 */
export function MarketApplicationListHeader() {
  const appLabel = useI18n('applications.dialog.install.columnApp');
  const installedLabel = useI18n('applications.dialog.install.columnInstalled');
  const latestLabel = useI18n('applications.dialog.install.columnLatest');
  const actionLabel = useI18n('applications.dialog.install.columnAction');

  return (
    <div
      role="row"
      className={cn(
        MARKET_GRID_CLASS,
        'bg-surface-neutral border-bdr-soft text-subtle sticky top-0 z-10 border-b py-2 text-sm font-semibold',
        'max-lg:sr-only',
      )}
    >
      <span role="columnheader">{appLabel}</span>
      <span role="columnheader" className="justify-self-end px-1">
        {installedLabel}
      </span>
      <span role="columnheader" className="justify-self-end px-1">
        {latestLabel}
      </span>
      <span role="columnheader" className="justify-self-center">
        {actionLabel}
      </span>
    </div>
  );
}
