import {cn} from '@enonic/ui';
import {Package} from 'lucide-react';
import type {ReactElement} from 'react';
import {useI18n} from '../../features/hooks/useI18n';
import {Badge} from '../../shared/ui/Badge';
import type {BadgeProps} from '../../shared/ui/Badge';
import type {ApplicationDto, ApplicationState} from '../../features/types/application';

interface Props {
    app: ApplicationDto;
    selected: boolean;
}

/**
 * Visual presentation of a single application row inside the browse grid.
 * Selection styling, focus, and keyboard navigation are owned by the parent
 * `GridList.Row`; this component only paints content.
 */
export const BrowseRow = ({app, selected}: Props): ReactElement => {
    const stateLabel = useStateLabel(app.state);

    return (
        <div
            className={cn(
                'grid w-full items-center gap-3 px-4 py-3',
                'grid-cols-[auto_minmax(0,1fr)_auto_auto]',
                'border-b border-bdr-soft',
                app.system && 'opacity-80',
            )}
            data-system={app.system || undefined}
            data-selected={selected || undefined}
        >
            <Icon iconUrl={app.iconUrl} />
            <div className="flex flex-col overflow-hidden">
                <span className="font-semibold leading-5.5 truncate group-data-[tone=inverse]:text-alt">
                    {app.displayName}
                </span>
                <small className="text-sm leading-4.5 text-subtle truncate group-data-[tone=inverse]:text-alt">
                    {[app.vendorName, app.description].filter(Boolean).join(' — ')}
                </small>
            </div>
            <span className="text-sm tabular-nums text-subtle group-data-[tone=inverse]:text-alt">
                {app.version}
            </span>
            <Badge tone={stateTone(app.state)} size="sm">{stateLabel}</Badge>
        </div>
    );
};

BrowseRow.displayName = 'BrowseRow';

function stateTone(state: ApplicationState): BadgeProps['tone'] {
    switch (state) {
        case 'started':
            return 'success';
        case 'stopped':
            return 'warning';
        default:
            return 'neutral';
    }
}

const Icon = ({iconUrl}: {iconUrl: string}): ReactElement => {
    if (iconUrl) {
        return (
            <img
                src={iconUrl}
                alt=""
                aria-hidden="true"
                className="size-8 shrink-0 rounded-sm object-cover"
                loading="lazy"
            />
        );
    }
    return <Package className="size-8 shrink-0 text-subtle" aria-hidden="true" />;
};

Icon.displayName = 'BrowseRow.Icon';

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
