import { Button, cn, Skeleton } from '@enonic/ui';

import type { MarketApplicationsState } from '../../../entities/market';
import { useI18n } from '../../../shared/i18n';
import type { MarketInstall } from '../model/install.store';
import type { MarketRow } from '../model/market-rows';
import {
  MARKET_ACTION_CELL_CLASS,
  MARKET_APP_CELL_CLASS,
  MARKET_GRID_CLASS,
  MARKET_LIST_CLASS,
  MARKET_VERSION_CELL_CLASS,
} from './market-grid';
import { MarketApplicationRow } from './MarketApplicationRow';

export type MarketApplicationListProps = {
  status: MarketApplicationsState['status'];
  rows: readonly MarketRow[];
  /** Whether the search narrowed the list — an empty result then means no match, not an empty catalogue. */
  narrowed: boolean;
  installs: Readonly<Record<string, MarketInstall>>;
  onInstall: (row: MarketRow) => void;
  onRetry: () => void;
};

const SKELETON_ROWS = 8;

/** What Enonic Market offers, or why there is nothing to offer. */
export function MarketApplicationList({
  status,
  rows,
  narrowed,
  installs,
  onInstall,
  onRetry,
}: MarketApplicationListProps) {
  const errorLabel = useI18n('applications.dialog.install.error');
  const emptyLabel = useI18n('applications.dialog.install.empty');
  const noMatchesLabel = useI18n('applications.dialog.install.noMatches');
  const retryLabel = useI18n('applications.dialog.install.retry');

  if (status === 'loading') {
    return (
      <div aria-busy="true" className={MARKET_LIST_CLASS}>
        {Array.from({ length: SKELETON_ROWS }, (_, index) => (
          <Skeleton.Group key={index} className={MARKET_GRID_CLASS}>
            <div className={cn(MARKET_APP_CELL_CLASS, 'flex items-center gap-2.5')}>
              <Skeleton shape="rectangle" className="size-6 shrink-0" />
              <div className="flex flex-col gap-1">
                <Skeleton shape="rectangle" className="h-5 w-36" />
                <Skeleton shape="rectangle" className="h-4 w-24" />
              </div>
            </div>
            <Skeleton
              shape="rectangle"
              className={cn(MARKET_VERSION_CELL_CLASS, 'h-4 w-12 max-lg:my-1 max-lg:w-32')}
            />
            <div className={MARKET_ACTION_CELL_CLASS}>
              <Skeleton shape="rectangle" className="h-9 w-full max-lg:h-8" />
            </div>
          </Skeleton.Group>
        ))}
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <p role="alert" className="text-error text-sm">
          {errorLabel}
        </p>
        <Button variant="outline" label={retryLabel} onClick={onRetry} />
      </div>
    );
  }
  if (rows.length === 0) {
    return narrowed ? (
      <p className="text-subtle px-2.5 py-10 text-center text-sm">{noMatchesLabel}</p>
    ) : (
      <div className="flex flex-col items-center gap-4 py-10">
        <p className="text-subtle text-sm">{emptyLabel}</p>
        <Button variant="outline" label={retryLabel} onClick={onRetry} />
      </div>
    );
  }

  return (
    <ul className={MARKET_LIST_CLASS}>
      {rows.map((row) => (
        <MarketApplicationRow
          key={row.key}
          row={row}
          install={installs[row.key]}
          onInstall={onInstall}
        />
      ))}
    </ul>
  );
}
