import type {Application} from '@enonic/lib-admin-ui/app/Application';
import type {ReactElement} from 'react';

interface Props {
    application: Application;
}

/**
 * Top chrome of the Applications admin tool. Shows the Enonic glyph + tool
 * name on the left; the right side is intentionally left to the launcher
 * application, which appends its avatar + XP launcher into the legacy
 * `.appbar` mount kept at the end of this header.
 */
export const TopBar = ({application}: Props): ReactElement => {
    return (
        <header
            className="shrink-0 h-14 flex items-center gap-3 px-4 bg-surface-neutral border-b border-bdr-soft relative"
            data-component="TopBar"
        >
            <div className="flex items-center gap-2.5">
                <span className="inline-flex size-7 items-center justify-center text-main">
                    <EnonicGlyph />
                </span>
                <span className="text-base font-semibold text-main">{application.getName()}</span>
            </div>
            <div className="flex-1" />
            <div className="appbar" aria-hidden="true" data-component="TopBar.LegacyMount" style={{display: 'none'}} />
        </header>
    );
};

TopBar.displayName = 'TopBar';

const EnonicGlyph = (): ReactElement => (
    <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
            fillRule="evenodd"
            d="M 3.003 8.35 C 3.65 4.682 6.583 1.893 10 1.893 C 13.416 1.893 16.347 4.682 16.994 8.35 L 18.871 8.35 C 18.2 3.686 14.517 0 10 0 C 5.517 0 1.803 3.686 1.128 8.35 L 3.003 8.35 Z"
        />
        <path
            fillRule="evenodd"
            d="M 16.998 11.654 C 16.378 15.315 13.437 18.085 10.001 18.085 C 6.563 18.085 3.619 15.315 3.001 11.654 L 1.128 11.654 C 1.772 16.307 5.497 20 10.001 20 C 14.537 20 18.234 16.307 18.871 11.654 L 16.998 11.654 Z"
        />
    </svg>
);
