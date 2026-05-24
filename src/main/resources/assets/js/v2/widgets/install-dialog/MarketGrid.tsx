import {useStore} from '@nanostores/preact';
import type {ReactElement} from 'react';
import {useEffect} from 'react';
import {listMarketApplications} from '../../entities/market/api/market';
import {useI18n} from '../../shared/i18n/useI18n';
import {
    $isMarketEmpty,
    $market,
    $marketAppStatuses,
    $visibleMarketItems,
    setItems,
    setStatus,
} from '../../features/install-app/store/market-search';
import {Spinner} from '../../shared/ui/Spinner';
import {MarketRow} from './MarketRow';

/**
 * Renders the market catalog inside the install dialog. Mirrors the legacy
 * `MarketAppsTreeGrid` lifecycle:
 *
 * - First mount kicks off `listMarketApplications()` when the store is still
 *   `idle`.
 * - Subsequent renders read items + per-item status from the market store.
 *
 * Virtualisation is deliberately omitted — the registry currently returns ~50
 * apps and a flat list is cheaper than wiring `react-virtuoso`. The phase doc
 * leaves switching to a virtualised list as a future optimisation if catalog
 * size grows.
 */
export const MarketGrid = (): ReactElement => {
    const market = useStore($market);
    const visible = useStore($visibleMarketItems) ?? [];
    const statuses = useStore($marketAppStatuses) ?? {};
    const isEmpty = useStore($isMarketEmpty);

    const loadingLabel = useI18n('market.loadAppList');
    const emptyLabel = useI18n('market.noAppsFound');
    const errorLabel = useI18n('market.failed');

    useEffect(() => {
        if ($market.get().status !== 'idle') return undefined;
        let cancelled = false;
        (async (): Promise<void> => {
            setStatus('loading');
            try {
                const items = await listMarketApplications();
                if (cancelled) return;
                setItems(items);
                setStatus('loaded');
            } catch {
                if (cancelled) return;
                setStatus('error');
            }
        })();
        return (): void => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="flex flex-col flex-1 min-h-60 border border-bdr-soft rounded-md overflow-auto" data-testid="MarketGrid">
            {market.status === 'loading' ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-subtle" data-testid="MarketGrid.Loading">
                    <Spinner size="sm" label={loadingLabel} />
                    {loadingLabel}
                </div>
            ) : market.status === 'error' ? (
                <div className="flex items-center justify-center py-10 text-sm text-error" data-testid="MarketGrid.Error">
                    {errorLabel}
                </div>
            ) : isEmpty ? (
                <div className="flex items-center justify-center py-10 text-sm text-subtle" data-testid="MarketGrid.Empty">
                    {emptyLabel}
                </div>
            ) : (
                visible.map((item) => (
                    <MarketRow key={item.key} item={item} status={statuses[item.key] ?? 'not_installed'} />
                ))
            )}
        </div>
    );
};

MarketGrid.displayName = 'MarketGrid';
