import {IconButton, Tooltip} from '@enonic/ui';
import {ExternalLink, MoreHorizontal, X} from 'lucide-react';
import type {ReactElement} from 'react';
import type {ApplicationDto} from '../../entities/application/types/Application';
import {clearSelection} from '../../pages/applications/store/selection';
import {useI18n} from '../../shared/i18n/useI18n';

interface Props {
    app?: ApplicationDto;
}

/**
 * The 56px chrome at the top of the right detail panel. Houses the
 * "APPLICATION DETAILS" label on the left and the homepage / more / close
 * icon buttons on the right. Designed to match the height and feel of the
 * actions toolbar / list-header strip on the other side of the divider.
 */
export const DetailToolbar = ({app}: Props): ReactElement => {
    const title = useI18n('field.applicationDetails');
    const homepageLabel = useI18n('action.homepage');
    const moreLabel = useI18n('action.more');
    const closeLabel = useI18n('action.close');

    const handleClose = (): void => {
        clearSelection();
    };

    const homepageHref = app?.url || app?.vendorUrl;
    const hasHomepage = Boolean(homepageHref);

    return (
        <div
            className="h-14 px-3 flex items-center gap-1 border-b border-bdr-soft shrink-0"
            data-testid="DetailPanel.Toolbar"
        >
            <span
                className="text-xs font-bold uppercase tracking-wider text-subtle pl-2"
                data-testid="DetailPanel.Toolbar.Title"
            >
                {title}
            </span>
            <div className="flex-1" />
            {app ? (
                <>
                    <Tooltip delay={300} value={homepageLabel} asChild>
                        <IconButton
                            variant="text"
                            size="sm"
                            icon={ExternalLink}
                            disabled={!hasHomepage}
                            title={homepageLabel}
                            onClick={() => {
                                if (homepageHref) window.open(homepageHref, '_blank', 'noreferrer');
                            }}
                            data-testid="DetailPanel.Toolbar.Homepage"
                        />
                    </Tooltip>
                    <Tooltip delay={300} value={moreLabel} asChild>
                        <IconButton
                            variant="text"
                            size="sm"
                            icon={MoreHorizontal}
                            title={moreLabel}
                            data-testid="DetailPanel.Toolbar.More"
                        />
                    </Tooltip>
                </>
            ) : null}
            <Tooltip delay={300} value={closeLabel} asChild>
                <IconButton
                    variant="text"
                    size="sm"
                    icon={X}
                    title={closeLabel}
                    onClick={handleClose}
                    data-testid="DetailPanel.Toolbar.Close"
                />
            </Tooltip>
        </div>
    );
};

DetailToolbar.displayName = 'DetailPanel.Toolbar';
