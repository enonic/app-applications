import {IconButton, Tooltip} from '@enonic/ui';
import {ExternalLink, X} from 'lucide-react';
import type {ReactElement} from 'react';
import type {ApplicationDto} from '../../entities/application/types/Application';
import {clearSelection} from '../../pages/applications/store/selection';
import {useI18n} from '../../shared/i18n/useI18n';

interface Props {
    app?: ApplicationDto;
}

/**
 * The 56px chrome at the top of the right detail panel. Houses the
 * "APPLICATION DETAILS" label on the left and the homepage / close icon
 * buttons on the right. Designed to match the height and feel of the actions
 * toolbar / list-header strip on the other side of the divider.
 */
export const DetailToolbar = ({app}: Props): ReactElement => {
    const title = useI18n('field.applicationDetails');
    const homepageLabel = useI18n('action.homepage');
    const closeLabel = useI18n('action.close');

    const handleClose = (): void => {
        clearSelection();
    };

    const homepageHref = app?.url || app?.vendorUrl;
    const hasHomepage = Boolean(homepageHref);

    return (
        <div
            className="h-14 px-3 flex items-center gap-1 border-b border-bdr-soft shrink-0"
            data-component="DetailPanel.Toolbar"
        >
            <span
                className="text-xs font-bold uppercase tracking-wider text-subtle pl-2"
                data-component="DetailPanel.Toolbar.Title"
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
                            aria-label={homepageLabel}
                            onClick={() => {
                                if (homepageHref) window.open(homepageHref, '_blank', 'noreferrer');
                            }}
                            data-component="DetailPanel.Toolbar.Homepage"
                        />
                    </Tooltip>
                    <Tooltip delay={300} value={closeLabel} asChild>
                        <IconButton
                            variant="text"
                            size="sm"
                            icon={X}
                            aria-label={closeLabel}
                            onClick={handleClose}
                            data-component="DetailPanel.Toolbar.Close"
                        />
                    </Tooltip>
                </>
            ) : null}
        </div>
    );
};

DetailToolbar.displayName = 'DetailPanel.Toolbar';
