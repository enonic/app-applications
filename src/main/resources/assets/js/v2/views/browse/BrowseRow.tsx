import {Checkbox, cn} from '@enonic/ui';
import {Package} from 'lucide-react';
import type {ReactElement} from 'react';
import {useStore} from '@nanostores/preact';
import {useI18n} from '../../features/hooks/useI18n';
import {$applications, setSelection} from '../../features/store/applications.store';
import type {ApplicationDto, ApplicationState} from '../../features/types/application';

interface Props {
    app: ApplicationDto;
    selected: boolean;
}

/**
 * Visual content of a single application row inside the browse grid. The
 * surrounding `GridList.Row` owns selection styling, focus and keyboard
 * navigation — this component only paints.
 *
 * Layout: checkbox | icon | name + description | version | status text.
 * LOCAL / SYSTEM badges sit next to the display name; status is plain text
 * (no leading dot) per the modernised Enonic UI patterns.
 */
export const BrowseRow = ({app, selected}: Props): ReactElement => {
    const stateLabel = useStateLabel(app.state);
    const sourceLabel = useSourceLabel(app);
    const selection = useStore($applications).selection;

    const handleToggle = (): void => {
        if (selected) {
            setSelection(selection.filter((k) => k !== app.key));
            return;
        }
        setSelection([...selection, app.key]);
    };

    const stateColor = stateColorClass(app.state, selected);

    return (
        <div
            className={cn(
                'grid w-full items-center gap-3 px-5 py-3',
                'grid-cols-[auto_auto_minmax(0,1fr)_auto_auto]',
                'border-b border-bdr-soft',
            )}
            data-system={app.system || undefined}
            data-selected={selected || undefined}
        >
            <Checkbox
                checked={selected}
                onCheckedChange={handleToggle}
                onClick={(e) => e.stopPropagation()}
                data-testid="BrowseRow.Checkbox"
            />
            <Icon iconUrl={app.iconUrl} />
            <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold leading-5.5 truncate">{app.displayName}</span>
                    {sourceLabel ? <SourceTag label={sourceLabel} system={app.system} /> : null}
                </div>
                <small
                    className={cn(
                        'text-sm leading-4.5 truncate',
                        selected ? 'text-alt/70' : 'text-subtle',
                    )}
                >
                    {app.description || app.vendorName}
                </small>
            </div>
            <span
                className={cn(
                    'text-sm font-mono tabular-nums min-w-25 text-right',
                    selected ? 'text-alt/70' : 'text-subtle',
                )}
            >
                {app.version}
            </span>
            <span className={cn('text-sm min-w-18 text-right', stateColor)}>{stateLabel}</span>
        </div>
    );
};

BrowseRow.displayName = 'BrowseRow';

function stateColorClass(state: ApplicationState, selected: boolean): string {
    if (selected) {
        return state === 'started' ? 'text-success-rev' : 'text-alt/70';
    }
    return state === 'started' ? 'text-success' : 'text-subtle';
}

const Icon = ({iconUrl}: {iconUrl: string}): ReactElement => {
    if (iconUrl) {
        return (
            <img
                src={iconUrl}
                alt=""
                aria-hidden="true"
                className="size-9 shrink-0 rounded-sm object-cover"
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

const SourceTag = ({label, system}: {label: string; system: boolean}): ReactElement => {
    return (
        <span
            className={cn(
                'inline-flex items-center h-4.5 px-1.5 rounded-full',
                'text-[10px] font-bold uppercase tracking-wide',
                system
                    ? 'bg-muted text-subtle'
                    : 'bg-info/15 text-info',
                'group-data-[tone=inverse]:bg-white/20 group-data-[tone=inverse]:text-alt',
            )}
            data-testid="BrowseRow.SourceTag"
        >
            {label}
        </span>
    );
};

SourceTag.displayName = 'BrowseRow.SourceTag';

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

function useSourceLabel(app: ApplicationDto): string | undefined {
    const local = useI18n('field.source.local');
    const system = useI18n('field.source.system');
    if (app.system) return system;
    if (app.local) return local;
    return undefined;
}
