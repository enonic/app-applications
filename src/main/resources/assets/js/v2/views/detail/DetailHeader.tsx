import {Menu, cn} from '@enonic/ui';
import {ChevronDown, Package} from 'lucide-react';
import type {ReactElement} from 'react';
import {useStore} from '@nanostores/preact';
import {startApplications, stopApplications} from '../../features/api/applications';
import {useI18n} from '../../features/hooks/useI18n';
import {$app} from '../../features/store/app.store';
import {markStarting, markStopping} from '../../features/store/app-actions.store';
import type {ApplicationDto, ApplicationState} from '../../features/types/application';

interface Props {
    app: ApplicationDto;
}

export const DetailHeader = ({app}: Props): ReactElement => {
    const readonly = useStore($app).readonly;
    const startLabel = useI18n('action.start');
    const stopLabel = useI18n('action.stop');
    const stateLabel = useStateLabel(app.state);

    const handleStart = (): void => {
        markStarting([app.key]);
        void startApplications([app.key]);
    };
    const handleStop = (): void => {
        markStopping([app.key]);
        void stopApplications([app.key]);
    };

    const showStart = !readonly && app.state !== 'started' && !app.system;
    const showStop = !readonly && app.state === 'started' && !app.system;
    const hasActions = showStart || showStop;

    return (
        <header
            className="flex items-start gap-5 border-b border-bdr-subtle bg-surface-neutral px-8 py-6"
            data-testid="DetailPanel.Header"
        >
            <Icon iconUrl={app.iconUrl} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <h1 className="truncate text-2xl font-semibold text-main">{app.displayName}</h1>
                {app.description ? (
                    <p className="truncate text-sm text-subtle">{app.description}</p>
                ) : null}
                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-subtle">
                    {app.vendorName ? <span>{app.vendorName}</span> : null}
                    {app.vendorName ? <span aria-hidden="true">·</span> : null}
                    <span className="tabular-nums">{app.version}</span>
                </div>
            </div>
            {hasActions ? (
                <Menu>
                    <Menu.Trigger
                        className={cn(
                            'inline-flex items-center gap-2 rounded-sm border border-bdr-subtle bg-surface-primary px-3 py-1.5 text-sm font-semibold text-main',
                            'hover:bg-surface-primary-hover',
                            stateTone(app.state),
                        )}
                        data-testid="DetailPanel.Header.Actions"
                    >
                        {stateLabel}
                        <ChevronDown className="size-4" aria-hidden="true" />
                    </Menu.Trigger>
                    <Menu.Portal>
                        <Menu.Content align="end" className="min-w-40">
                            {showStart ? (
                                <Menu.Item onSelect={handleStart} data-testid="DetailPanel.Header.Start">
                                    {startLabel}
                                </Menu.Item>
                            ) : null}
                            {showStop ? (
                                <Menu.Item onSelect={handleStop} data-testid="DetailPanel.Header.Stop">
                                    {stopLabel}
                                </Menu.Item>
                            ) : null}
                        </Menu.Content>
                    </Menu.Portal>
                </Menu>
            ) : (
                <span
                    className={cn(
                        'inline-flex items-center rounded-sm px-3 py-1.5 text-sm font-semibold',
                        stateTone(app.state),
                    )}
                    data-testid="DetailPanel.Header.State"
                >
                    {stateLabel}
                </span>
            )}
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
                className="size-16 shrink-0 rounded-sm object-cover"
                loading="lazy"
            />
        );
    }
    return <Package className="size-16 shrink-0 text-subtle" aria-hidden="true" />;
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

function stateTone(state: ApplicationState): string {
    switch (state) {
        case 'started':
            return 'bg-success/15 text-success';
        case 'stopped':
            return 'bg-warning/15 text-warning';
        default:
            return 'bg-bdr-subtle/40 text-subtle';
    }
}
