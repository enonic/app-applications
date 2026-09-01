import { cn, Link, Tooltip } from '@enonic/ui';

import { ApplicationIcon } from '../../../entities/application';
import { useI18n } from '../../../shared/i18n';
import { ItemLabel } from '../../../shared/ui/ItemLabel';
import { ProgressButton } from '../../../shared/ui/ProgressButton';
import type { MarketInstall } from '../model/install.store';
import { canInstall, type MarketRow } from '../model/market-rows';
import {
  MARKET_ACTION_CELL_CLASS,
  MARKET_APP_CELL_CLASS,
  MARKET_GRID_CLASS,
  MARKET_VERSION_CELL_CLASS,
  MARKET_VERSIONS_CLASS,
} from './market-grid';

export type MarketApplicationRowProps = {
  row: MarketRow;
  install?: MarketInstall;
  onInstall: (row: MarketRow) => void;
};

const TOOLTIP_DELAY = 300;

/** One market entry: what it is, what versions there are of it, and what can be done with it. */
export function MarketApplicationRow({ row, install, onInstall }: MarketApplicationRowProps) {
  const installLabel = useI18n('applications.dialog.install.install');
  const updateLabel = useI18n('applications.dialog.install.update');
  const installedLabel = useI18n('applications.dialog.install.installed');
  const marketLinkLabel = useI18n('applications.details.marketLink');

  const installing = install != null;

  return (
    <div role="row" className={cn(MARKET_GRID_CLASS, 'min-h-12 py-2')}>
      {/* App info */}
      <div role="cell" className={MARKET_APP_CELL_CLASS}>
        <ItemLabel
          icon={<ApplicationIcon icon={row.iconUrl} />}
          primary={row.displayName}
          secondary={row.description}
        />
      </div>

      <div role="presentation" className={MARKET_VERSIONS_CLASS}>
        {/* Installed */}
        <span
          role="cell"
          className={cn(MARKET_VERSION_CELL_CLASS, 'max-lg:empty:hidden')}
          title={row.installedVersion}
        >
          {row.installedVersion}
        </span>

        {row.installedVersion != null && (
          <span aria-hidden className="text-subtle text-xs lg:hidden">
            |
          </span>
        )}

        {/* Available */}
        <span role="cell" className={MARKET_VERSION_CELL_CLASS}>
          {row.pageUrl == null ? (
            row.availableVersion
          ) : (
            <Tooltip value={marketLinkLabel} side="top" delay={TOOLTIP_DELAY} asChild>
              <Link
                href={row.pageUrl}
                newTab
                rightIcon={false}
                aria-label={marketLinkLabel}
                className="focus-visible:ring-ring max-w-full rounded-sm visited:text-inherit focus-visible:bg-transparent focus-visible:text-inherit focus-visible:ring-2 max-lg:text-xs"
              >
                <span className="min-w-0 truncate">{row.availableVersion}</span>
              </Link>
            </Tooltip>
          )}
        </span>
      </div>

      {/* Action */}
      <div role="cell" className={MARKET_ACTION_CELL_CLASS}>
        {row.status === 'installed' && !installing && (
          <span className="text-sm opacity-30 max-lg:text-xs">{installedLabel}</span>
        )}
        {(canInstall(row) || installing) && (
          <ProgressButton
            variant="outline"
            size="sm"
            label={row.status === 'update' ? updateLabel : installLabel}
            progress={installing ? (install.percent ?? 0) : undefined}
            onClick={() => onInstall(row)}
            className="min-w-24 max-lg:h-8 max-lg:min-w-20 max-lg:px-2.5 max-lg:text-xs"
          />
        )}
      </div>
    </div>
  );
}
