import type {Application} from '@enonic/lib-admin-ui/app/Application';
import {useStore} from '@nanostores/preact';
import type {ReactElement} from 'react';
import {useEffect} from 'react';
import {listApplications} from '../../entities/application/api/applications';
import {$applications, setApplications, setStatus} from '../../entities/application/store/applications';
import {UninstallConfirmDialog} from '../../features/uninstall-app/ui/UninstallConfirmDialog';
import {useI18n} from '../../shared/i18n/useI18n';
import {pushToast} from '../../shared/ui/toaster/store/notifications';
import {BrowseFilters} from '../../widgets/browse-list/BrowseFilters';
import {BrowseGrid} from '../../widgets/browse-list/BrowseGrid';
import {BrowseToolbar} from '../../widgets/browse-list/BrowseToolbar';
import {DetailPanel} from '../../widgets/detail-panel/DetailPanel';
import {InstallDialog} from '../../widgets/install-dialog/InstallDialog';
import {TopBar} from '../../widgets/top-bar/TopBar';

interface Props {
    application: Application;
}

/**
 * Composition root for the Applications admin tool. Owns the data load for the
 * applications list and mounts every widget plus the dialogs the widgets
 * trigger (widgets trigger; pages mount — see plan rule 2).
 */
export const ApplicationsPage = ({application}: Props): ReactElement => {
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
        <div className="flex h-full w-full min-h-0 flex-col">
            <TopBar application={application} />
            <div className="flex w-full min-h-0 flex-1 flex-row bg-surface-primary">
                <div className="flex h-full min-w-0 flex-1 flex-col">
                    <div className="flex flex-col h-full w-full bg-surface-neutral text-main" data-testid="BrowsePage">
                        <BrowseToolbar />
                        <BrowseFilters />
                        {status === 'error' ? (
                            <div className="flex-1 flex items-center justify-center text-error text-sm py-10">
                                {listFailedLabel}
                            </div>
                        ) : (
                            <BrowseGrid />
                        )}
                    </div>
                </div>
                <DetailPanel />
            </div>
            <InstallDialog />
            <UninstallConfirmDialog />
        </div>
    );
};

ApplicationsPage.displayName = 'ApplicationsPage';
