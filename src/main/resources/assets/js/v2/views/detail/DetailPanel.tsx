import {useStore} from '@nanostores/preact';
import type {ReactElement} from 'react';
import {useEffect} from 'react';
import {getApplicationInfo} from '../../features/api/applications';
import {$applications, setApplicationInfo} from '../../features/store/applications.store';
import {DetailHeader} from './DetailHeader';
import {AppInfoSection} from './sections/AppInfoSection';
import {DeploymentSection} from './sections/DeploymentSection';
import {ExtensionsSection} from './sections/ExtensionsSection';
import {MacrosSection} from './sections/MacrosSection';
import {ProvidersSection} from './sections/ProvidersSection';
import {SiteSection} from './sections/SiteSection';
import {TasksSection} from './sections/TasksSection';

/**
 * Right-hand statistics pane that replaces the legacy `ApplicationItemStatisticsPanel`.
 *
 * Subscribes to the first selected application; when it changes, fetches
 * `application/info` and caches the resolved DTO in `$applications.infoByKey`.
 * The body renders header + sections in a single scrollable column — no tabs,
 * matching the legacy layout.
 */
export const DetailPanel = (): ReactElement => {
    const {byKey, infoByKey, selection} = useStore($applications);

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
                /* surface via toast once notifications.store is wired (phase 9) */
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [selectedKey]);

    if (!app) {
        return (
            <aside
                className="h-full w-full min-w-0 flex-1 bg-surface-primary"
                data-testid="DetailPanel.Empty"
            />
        );
    }

    return (
        <aside
            className="flex h-full w-full min-w-0 flex-1 flex-col overflow-hidden bg-surface-primary"
            data-testid="DetailPanel"
        >
            <DetailHeader app={app} />
            <div className="flex-1 overflow-y-auto px-8 pb-8">
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
            </div>
        </aside>
    );
};

DetailPanel.displayName = 'DetailPanel';
