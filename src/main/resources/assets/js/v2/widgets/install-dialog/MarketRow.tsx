import {Button} from '@enonic/ui';
import {CheckCircle2, Download, RefreshCw} from 'lucide-react';
import type {ReactElement} from 'react';
import {useState} from 'react';
import {installApplicationFromUrl} from '../../features/install-app/api/install';
import {useI18n} from '../../shared/i18n/useI18n';
import {pushToast} from '../../shared/ui/toaster/store/notifications';
import {Spinner} from '../../shared/ui/Spinner';
import type {MarketAppStatus, MarketItemDto} from '../../entities/market/types/Market';

interface Props {
    item: MarketItemDto;
    status: MarketAppStatus;
}

/**
 * Single market application row used inside `MarketGrid`. The action button
 * encodes the derived `MarketAppStatus` — Install for a fresh install, Update
 * for a newer version, Installing… while in flight, Installed when current.
 *
 * The "installing" badge is driven by `$appActions.installing[item.key]`,
 * which the server-events bridge populates on the `PROGRESS` event using the
 * authoritative application key. To bridge the click → first-PROGRESS gap
 * (sub-second under normal conditions) the button briefly disables itself via
 * local state.
 */
export const MarketRow = ({item, status}: Props): ReactElement => {
    const installLabel = useI18n('action.install');
    const updateLabel = useI18n('action.update');
    const installingLabel = useI18n('text.installing');
    const installedLabel = useI18n('text.installed');
    const installFailedLabel = useI18n('notify.error.installFailed');

    const [requested, setRequested] = useState(false);
    const showInstalling = status === 'installing' || requested;

    const handleInstall = (): void => {
        if (!item.downloadUrl) return;
        setRequested(true);
        installApplicationFromUrl(item.downloadUrl, item.sha512 || undefined)
            .catch((cause): void => {
                const detail = cause instanceof Error ? cause.message : String(cause);
                pushToast({tone: 'error', message: `${installFailedLabel}: ${detail}`});
            })
            .finally((): void => {
                setRequested(false);
            });
    };

    return (
        <div
            className="flex items-center gap-3 px-4 py-3 border-b border-bdr-soft last:border-b-0"
            data-status={status}
            data-testid="MarketRow"
        >
            {item.iconUrl ? (
                <img src={item.iconUrl} alt="" className="size-10 rounded-sm shrink-0" />
            ) : (
                <div className="size-10 rounded-sm bg-surface-neutral shrink-0" aria-hidden="true" />
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    {item.url ? (
                        <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium truncate text-main hover:underline"
                            title={item.displayName}
                        >
                            {item.displayName}
                        </a>
                    ) : (
                        <span className="font-medium truncate" title={item.displayName}>{item.displayName}</span>
                    )}
                    {item.latestVersion ? (
                        <span className="text-xs text-subtle tabular-nums">{item.latestVersion}</span>
                    ) : null}
                </div>
                {item.vendorName ? (
                    <p className="text-xs text-subtle truncate">{item.vendorName}</p>
                ) : null}
                {item.description ? (
                    <p className="text-sm text-subtle truncate" title={item.description}>{item.description}</p>
                ) : null}
            </div>
            {renderAction({
                status: showInstalling ? 'installing' : status,
                onInstall: handleInstall,
                installLabel,
                updateLabel,
                installingLabel,
                installedLabel,
            })}
        </div>
    );
};

MarketRow.displayName = 'MarketRow';

interface ActionProps {
    status: MarketAppStatus;
    onInstall: () => void;
    installLabel: string;
    updateLabel: string;
    installingLabel: string;
    installedLabel: string;
}

function renderAction({
    status,
    onInstall,
    installLabel,
    updateLabel,
    installingLabel,
    installedLabel,
}: ActionProps): ReactElement {
    if (status === 'installing') {
        return (
            <div className="flex items-center gap-2 text-sm text-subtle" data-testid="MarketRow.Installing">
                <Spinner size="sm" label={installingLabel} />
                {installingLabel}
            </div>
        );
    }
    if (status === 'installed') {
        return (
            <Button
                variant="text"
                size="sm"
                startIcon={CheckCircle2}
                label={installedLabel}
                disabled
                data-testid="MarketRow.Installed"
            />
        );
    }
    if (status === 'older_version_installed') {
        return (
            <Button
                variant="solid"
                size="sm"
                startIcon={RefreshCw}
                label={updateLabel}
                onClick={onInstall}
                data-testid="MarketRow.Update"
            />
        );
    }
    return (
        <Button
            variant="solid"
            size="sm"
            startIcon={Download}
            label={installLabel}
            onClick={onInstall}
            data-testid="MarketRow.Install"
        />
    );
}
