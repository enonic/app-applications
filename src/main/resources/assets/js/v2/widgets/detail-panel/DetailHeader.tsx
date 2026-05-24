import {Button, Menu, cn} from '@enonic/ui';
import {ChevronDown, Package} from 'lucide-react';
import type {ReactElement} from 'react';
import {useStore} from '@nanostores/preact';
import type {ApplicationDto, ApplicationState} from '../../entities/application/types/Application';
import {startSelectedApplications, stopSelectedApplications} from '../../features/change-application-state';
import {openUninstallConfirm} from '../../pages/applications/store/dialogs';
import {$isReadonly} from '../../shared/config/readonly';
import {useI18n} from '../../shared/i18n/useI18n';

interface Props {
    app: ApplicationDto;
}

/**
 * Hero section at the top of the right detail body — large icon + name +
 * description, followed by the "Status" facet row (`Started | Source`) and
 * the action buttons (Start/Stop split button + Uninstall).
 */
export const DetailHeader = ({app}: Props): ReactElement => {
    const readonly = useStore($isReadonly);
    const statusTitle = useI18n('field.status');
    const startLabel = useI18n('action.start');
    const stopLabel = useI18n('action.stop');
    const startAppLabel = useI18n('action.startApplication');
    const stopAppLabel = useI18n('action.stopApplication');
    const uninstallLabel = useI18n('action.uninstall');
    const stateLabel = useStateLabel(app.state);
    const sourceLabel = useSourceLabel(app);

    const isStarted = app.state === 'started';
    const canControl = !readonly && !app.system;
    const canUninstall = !readonly && !app.system;

    const handleStart = (): void => {
        startSelectedApplications([app.key]);
    };
    const handleStop = (): void => {
        stopSelectedApplications([app.key]);
    };
    const handleUninstall = (): void => {
        openUninstallConfirm([app.key]);
    };

    const primaryLabel = isStarted ? stopAppLabel : startAppLabel;
    const handlePrimary = isStarted ? handleStop : handleStart;
    const stateTextColor = isStarted ? 'text-success' : 'text-subtle';

    return (
        <header className="px-6 pt-6 pb-2" data-component="DetailPanel.Header">
            <div className="flex items-start gap-4">
                <Icon iconUrl={app.iconUrl} />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <h1 className="truncate text-xl font-semibold text-main leading-tight">{app.displayName}</h1>
                    {app.description ? (
                        <p className="text-sm text-subtle leading-snug">{app.description}</p>
                    ) : null}
                </div>
            </div>

            <div className="mt-4">
                <div className="text-sm text-subtle mb-1">{statusTitle}</div>
                <div className="flex items-baseline gap-2.5 flex-wrap" data-component="DetailPanel.Header.Status">
                    <span className={cn('text-base font-semibold', stateTextColor)}>{stateLabel}</span>
                    <span aria-hidden="true" className="text-bdr-subtle text-base font-light">|</span>
                    <span className="text-base font-semibold italic text-main">{sourceLabel}</span>
                </div>
            </div>

            {canControl || canUninstall ? (
                <div className="mt-4 flex items-stretch gap-2" data-component="DetailPanel.Header.Actions">
                    {canControl ? (
                        <div className="flex flex-1 min-w-0 items-stretch">
                            <Button
                                variant="solid"
                                size="sm"
                                className="flex-1 rounded-r-none border-r-0 justify-center"
                                label={primaryLabel}
                                onClick={handlePrimary}
                                data-component="DetailPanel.Header.Primary"
                            />
                            <Menu>
                                <Menu.Trigger asChild>
                                    <Button
                                        variant="solid"
                                        size="sm"
                                        className="rounded-l-none px-2 border-l border-white/20"
                                        startIcon={ChevronDown}
                                        aria-label={primaryLabel}
                                        data-component="DetailPanel.Header.More"
                                    />
                                </Menu.Trigger>
                                <Menu.Portal>
                                    <Menu.Content align="end" className="min-w-44">
                                        <Menu.Item onSelect={handleStart} disabled={isStarted}>
                                            {startLabel}
                                        </Menu.Item>
                                        <Menu.Item onSelect={handleStop} disabled={!isStarted}>
                                            {stopLabel}
                                        </Menu.Item>
                                    </Menu.Content>
                                </Menu.Portal>
                            </Menu>
                        </div>
                    ) : null}
                    {canUninstall ? (
                        <Button
                            variant="outline"
                            size="sm"
                            label={uninstallLabel}
                            onClick={handleUninstall}
                            data-component="DetailPanel.Header.Uninstall"
                        />
                    ) : null}
                </div>
            ) : null}
        </header>
    );
};

DetailHeader.displayName = 'DetailPanel.Header';

const Icon = ({iconUrl}: {iconUrl: string}): ReactElement => {
    if (iconUrl) {
        return (
            <img
                src={iconUrl}
                alt=""
                aria-hidden="true"
                className="size-13 shrink-0 rounded-sm object-contain"
                loading="lazy"
            />
        );
    }
    return (
        <span
            aria-hidden="true"
            className="inline-flex size-13 shrink-0 items-center justify-center rounded-sm bg-surface-primary text-subtle"
        >
            <Package className="size-7" />
        </span>
    );
};

Icon.displayName = 'DetailPanel.Header.Icon';

function useStateLabel(state: ApplicationState): string {
    const started = useI18n('application.state.started');
    const stopped = useI18n('application.state.stopped');
    const unknown = useI18n('application.state.unknown');
    switch (state) {
        case 'started':
            return started;
        case 'stopped':
            return stopped;
        default:
            return unknown;
    }
}

function useSourceLabel(app: ApplicationDto): string {
    const local = useI18n('field.source.local');
    const system = useI18n('field.source.system');
    const market = useI18n('field.source.market');
    if (app.system) return system;
    if (app.local) return local;
    return market;
}
