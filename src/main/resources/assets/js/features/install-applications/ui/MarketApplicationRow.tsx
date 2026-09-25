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
  MARKET_ROW_CLASS,
  MARKET_VERSION_CELL_CLASS,
} from './market-grid';

export type MarketApplicationRowProps = {
  row: MarketRow;
  install?: MarketInstall;
  onInstall: (row: MarketRow) => void;
};

const TOOLTIP_DELAY = 300;

/** One market entry: what it is, its latest version, and what can be done with it. */
export function MarketApplicationRow({ row, install, onInstall }: MarketApplicationRowProps) {
  const installLabel = useI18n('applications.dialog.install.install');
  const updateLabel = useI18n('applications.dialog.install.update');
  const installedLabel = useI18n('applications.dialog.install.installed');
  const marketLinkLabel = useI18n('applications.details.marketLink');

  const installing = install != null;

  return (
    <li className={cn(MARKET_GRID_CLASS, MARKET_ROW_CLASS)}>
      {/* App info */}
      <div className={MARKET_APP_CELL_CLASS}>
        <ItemLabel
          icon={<ApplicationIcon icon={row.iconUrl} />}
          primary={row.displayName}
          secondary={row.description}
        />
      </div>

      {/* Available */}
      <span className={MARKET_VERSION_CELL_CLASS}>
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

      {/* Action */}
      <div className={MARKET_ACTION_CELL_CLASS}>
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
            className="w-full max-lg:h-8 max-lg:px-2.5 max-lg:text-xs"
          />
        )}
      </div>
    </li>
  );
}
