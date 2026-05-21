import {useStore} from '@nanostores/preact';
import type {ReactElement} from 'react';
import {useEffect} from 'react';
import {listApplications} from '../../features/api/applications';
import {useI18n} from '../../features/hooks/useI18n';
import {$applications, setApplications, setStatus} from '../../features/store/applications.store';
import {pushToast} from '../../features/store/notifications.store';
import {BrowseFilters} from './BrowseFilters';
import {BrowseGrid} from './BrowseGrid';
import {BrowseToolbar} from './BrowseToolbar';
import {UninstallConfirmDialog} from './UninstallConfirmDialog';

/**
 * Root of the new Preact browse view. Fires a single `listApplications()`
 * fetch on mount when the store is still `idle`; subsequent updates flow
 * through `ApplicationEvent` → store (see `features/events/applicationEvents`).
 */
export const BrowsePage = (): ReactElement => {
    const {status} = useStore($applications);
    const listFailedLabel = useI18n('notify.error.listFailed');

    useEffect(() => {
        if ($applications.get().status !== 'idle') return;
        let cancelled = false;
        (async () => {
            setStatus('loading');
            try {
                const items = await listApplications();
                if (cancelled) return;
                setApplications(items);
                setStatus('loaded');
            } catch {
                if (cancelled) return;
                setStatus('error');
                pushToast({tone: 'error', message: listFailedLabel});
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [listFailedLabel]);

    return (
        <div className="flex flex-col h-full w-full bg-surface-primary text-main" data-testid="BrowsePage">
            <BrowseToolbar />
            <BrowseFilters />
            {status === 'error' ? (
                <div className="flex-1 flex items-center justify-center text-error text-sm py-10">
                    {listFailedLabel}
                </div>
            ) : (
                <BrowseGrid />
            )}
            <UninstallConfirmDialog />
        </div>
    );
};

BrowsePage.displayName = 'BrowsePage';
