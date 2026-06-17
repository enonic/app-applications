import {Button, cn} from '@enonic/ui';
import {CheckCircle2, Download, Package, RefreshCw} from 'lucide-react';
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
 * Single market application row used inside `MarketGrid`. Visually mirrors
 * `BrowseRow` minus the checkbox — icon, display name + description, and a
 * trailing action that encodes the derived `MarketAppStatus`: Install for a
 * fresh install, Update for a newer version, Installing… while in flight,
 * Installed when current.
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
            className="flex w-full items-center gap-3 px-3 min-h-12"
            data-component="MarketRow"
            data-status={status}
        >
            <Icon iconUrl={item.iconUrl} />
            <div className="flex min-w-0 flex-1 flex-col text-left">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-semibold leading-5.5">{item.displayName}</span>
                    {item.latestVersion ? (
                        <span className="text-sm text-subtle font-mono tabular-nums shrink-0">
                            {item.latestVersion}
                        </span>
                    ) : null}
                </div>
                <small className="truncate text-sm leading-4.5 text-subtle">
                    {item.description || item.vendorName}
                </small>
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

const Icon = ({iconUrl}: {iconUrl: string}): ReactElement => {
    if (iconUrl) {
        return (
            <img
                src={iconUrl}
                alt=""
                aria-hidden="true"
                className="size-9 shrink-0 rounded-sm object-contain"
                loading="lazy"
            />
        );
    }
    return (
        <span
            aria-hidden="true"
            className={cn(
                'inline-flex size-9 shrink-0 items-center justify-center rounded-sm',
                'bg-surface-primary text-subtle',
            )}
        >
            <Package className="size-5" />
        </span>
    );
};

Icon.displayName = 'MarketRow.Icon';

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
            <div
                className="flex items-center gap-2 text-sm text-subtle min-w-25 justify-end"
                data-component="MarketRow.Installing"
            >
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
                data-component="MarketRow.Installed"
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
                data-component="MarketRow.Update"
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
            data-component="MarketRow.Install"
        />
    );
}
