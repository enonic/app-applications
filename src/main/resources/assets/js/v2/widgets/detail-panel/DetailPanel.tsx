import {useStore} from '@nanostores/preact';
import type {ReactElement} from 'react';
import {useEffect} from 'react';
import {getApplicationInfo} from '../../entities/application/api/applications';
import {$applications, setApplicationInfo} from '../../entities/application/store/applications';
import {$selection} from '../../pages/applications/store/selection';
import {useI18n} from '../../shared/i18n/useI18n';
import {pushToast} from '../../shared/ui/toaster/store/notifications';
import {DetailHeader} from './DetailHeader';
import {DetailToolbar} from './DetailToolbar';
import {AppInfoSection} from './sections/AppInfoSection';
import {DeploymentSection} from './sections/DeploymentSection';
import {ExtensionsSection} from './sections/ExtensionsSection';
import {MacrosSection} from './sections/MacrosSection';
import {ProvidersSection} from './sections/ProvidersSection';
import {SiteSection} from './sections/SiteSection';
import {TasksSection} from './sections/TasksSection';

/**
 * Right-hand statistics pane. Mirrors the design in
 * `chats/chat1.md`:
 *
 * 1. 56px toolbar header with the `APPLICATION DETAILS` label and external /
 *    more / close icon buttons.
 * 2. Hero — large app icon, display name, description.
 * 3. Status row (`Started | Source`) above the Start/Stop split button and
 *    Uninstall button.
 * 4. `Application` separator, then the metadata table (display name, key,
 *    version, installed, system required, source).
 * 5. `Admin extensions` separator, then the existing extensions section.
 */
export const DetailPanel = (): ReactElement => {
    const {byKey, infoByKey} = useStore($applications);
    const selection = useStore($selection);
    const infoFailedLabel = useI18n('notify.error.infoFailed');
    const emptyLabel = useI18n('text.detailPanel.empty');

    const selectedKey = selection[0];
    const app = selectedKey ? byKey[selectedKey] : undefined;
    const info = selectedKey ? infoByKey[selectedKey] : undefined;

    useEffect(() => {
        if (!selectedKey) return;
        let cancelled = false;
        (async () => {
            try {
                const next = await getApplicationInfo(selectedKey);
                if (cancelled) return;
                setApplicationInfo(selectedKey, next);
            } catch {
                if (cancelled) return;
                pushToast({tone: 'error', message: infoFailedLabel});
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [selectedKey, infoFailedLabel]);

    if (!app) {
        return (
            <aside
                className="h-full w-[440px] shrink-0 bg-surface-neutral border-l border-bdr-soft flex flex-col"
                data-component="DetailPanel.Empty"
            >
                <DetailToolbar />
                <div className="flex-1 flex items-center justify-center px-6">
                    <div className="w-full">
                        <span className="block text-subtle font-normal leading-normal">
                            {emptyLabel}
                        </span>
                    </div>
                </div>
            </aside>
        );
    }

    return (
        <aside
            className="flex h-full w-[440px] shrink-0 flex-col overflow-hidden bg-surface-neutral border-l border-bdr-soft"
            data-component="DetailPanel"
        >
            <DetailToolbar app={app} />
            <div className="flex-1 overflow-y-auto">
                <DetailHeader app={app} />
                <AppInfoSection app={app} />
                {info ? (
                    <>
                        <SiteSection info={info} />
                        <MacrosSection info={info} />
                        <ProvidersSection info={info} />
                        <TasksSection info={info} />
                        <ExtensionsSection info={info} />
                        <DeploymentSection info={info} />
                    </>
                ) : null}
                <div className="h-6" />
            </div>
        </aside>
    );
};

DetailPanel.displayName = 'DetailPanel';
