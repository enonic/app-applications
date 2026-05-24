import {cn} from '@enonic/ui';
import {Package} from 'lucide-react';
import type {ReactElement} from 'react';
import {useI18n} from '../../shared/i18n/useI18n';
import type {ApplicationDto, ApplicationState} from '../../entities/application/types/Application';

interface Props {
    app: ApplicationDto;
    selected: boolean;
}

export const BrowseRow = ({app, selected}: Props): ReactElement => {
    const stateLabel = useStateLabel(app.state);
    const sourceLabel = useSourceLabel(app);
    const stateClass = stateColorClass(app.state, selected);

    return (
        <div
            className="flex w-full items-center gap-3"
            data-system={app.system || undefined}
            data-component="BrowseRow"
        >
            <Icon iconUrl={app.iconUrl} />
            <div className="flex min-w-0 flex-1 flex-col text-left">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-semibold leading-5.5 group-data-[tone=inverse]:text-alt">
                        {app.displayName}
                    </span>
                    {sourceLabel ? <SourceTag label={sourceLabel} system={app.system} /> : null}
                </div>
                <small className="truncate text-sm leading-4.5 text-subtle group-data-[tone=inverse]:text-alt">
                    {app.description || app.vendorName}
                </small>
            </div>
            <span
                className={cn(
                    'min-w-25 text-right font-mono text-sm tabular-nums',
                    'text-subtle group-data-[tone=inverse]:text-alt',
                )}
            >
                {app.version}
            </span>
            <span className={cn('min-w-18 text-right text-sm', stateClass)}>{stateLabel}</span>
        </div>
    );
};

BrowseRow.displayName = 'BrowseRow';

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
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-sm bg-surface-primary text-subtle"
        >
            <Package className="size-5" />
        </span>
    );
};

Icon.displayName = 'BrowseRow.Icon';

interface SourceTagProps {
    label: string;
    system: boolean;
}

const SourceTag = ({label, system}: SourceTagProps): ReactElement => {
    const tone = system ? 'bg-muted text-subtle' : 'bg-info/15 text-info';
    return (
        <span
            className={cn(
                'inline-flex h-4.5 items-center rounded-full px-1.5',
                'text-[10px] font-bold uppercase tracking-wide',
                tone,
                'group-data-[tone=inverse]:bg-white/20 group-data-[tone=inverse]:text-alt',
            )}
            data-component="BrowseRow.SourceTag"
        >
            {label}
        </span>
    );
};

SourceTag.displayName = 'BrowseRow.SourceTag';

function stateColorClass(state: ApplicationState, selected: boolean): string {
    if (selected) return 'text-alt';
    return state === 'started' ? 'text-success' : 'text-subtle';
}

function useStateLabel(state: ApplicationState): string {
    const started = useI18n('application.state.started');
    const stopped = useI18n('application.state.stopped');
    const unknown = useI18n('application.state.unknown');
    if (state === 'started') return started;
    if (state === 'stopped') return stopped;
    return unknown;
}

function useSourceLabel(app: ApplicationDto): string | undefined {
    const local = useI18n('field.source.local');
    const system = useI18n('field.source.system');
    if (app.system) return system;
    if (app.local) return local;
    return undefined;
}
