import {Button, Toolbar} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import {Play, Plus, RefreshCw, Square, Trash2} from 'lucide-react';
import type {ReactElement} from 'react';
import {useI18n} from '../../features/hooks/useI18n';
import {listApplications, startApplications, stopApplications} from '../../features/api/applications';
import {$app} from '../../features/store/app.store';
import {markStarting, markStopping} from '../../features/store/app-actions.store';
import {$applications, $selectionInfo, setApplications, setStatus} from '../../features/store/applications.store';
import {openInstallDialog, openUninstallConfirm} from '../../features/store/dialogs.store';

/**
 * Top toolbar above the browse grid. Action buttons read `$selectionInfo` for
 * their disabled state and call the relevant API directly — store updates
 * follow optimistically and reconcile when the server emits the matching
 * `ApplicationEvent`.
 */
export const BrowseToolbar = (): ReactElement => {
    const info = useStore($selectionInfo);
    const readonly = useStore($app).readonly;

    const labels = {
        install: useI18n('action.install'),
        uninstall: useI18n('action.uninstall'),
        start: useI18n('action.start'),
        stop: useI18n('action.stop'),
        refresh: useI18n('action.refresh'),
        managed: useI18n('field.managed'),
        managedHelp: useI18n('field.managed.help'),
    };

    if (readonly) {
        return (
            <Toolbar>
                <Toolbar.Container
                    aria-label={labels.managed}
                    className="bg-surface-neutral h-15 px-5 py-2 flex items-center gap-3 border-b border-bdr-soft"
                >
                    <div className="flex flex-col">
                        <span className="font-semibold">{labels.managed}</span>
                        <small className="text-sm text-subtle">{labels.managedHelp}</small>
                    </div>
                </Toolbar.Container>
            </Toolbar>
        );
    }

    const handleInstall = (): void => {
        openInstallDialog();
    };

    const handleUninstall = (): void => {
        const keys = $applications.get().selection;
        if (keys.length === 0) return;
        openUninstallConfirm(keys);
    };

    const handleStart = (): void => {
        const keys = $applications.get().selection;
        if (keys.length === 0) return;
        markStarting(keys);
        void startApplications(keys);
    };

    const handleStop = (): void => {
        const keys = $applications.get().selection;
        if (keys.length === 0) return;
        markStopping(keys);
        void stopApplications(keys);
    };

    const handleRefresh = (): void => {
        setStatus('loading');
        (async () => {
            try {
                const items = await listApplications();
                setApplications(items);
                setStatus('loaded');
            } catch {
                setStatus('error');
            }
        })();
    };

    return (
        <Toolbar>
            <Toolbar.Container
                aria-label={labels.install}
                className="bg-surface-neutral h-15 px-5 py-2 flex items-center gap-2 border-b border-bdr-soft"
            >
                <Toolbar.Item asChild>
                    <Button
                        variant="solid"
                        size="md"
                        startIcon={Plus}
                        label={labels.install}
                        onClick={handleInstall}
                        data-testid="BrowseToolbar.Install"
                    />
                </Toolbar.Item>
                <Toolbar.Item asChild>
                    <Button
                        variant="outline"
                        size="md"
                        startIcon={Trash2}
                        label={labels.uninstall}
                        disabled={info.count === 0 || !info.canUninstall}
                        onClick={handleUninstall}
                        data-testid="BrowseToolbar.Uninstall"
                    />
                </Toolbar.Item>
                <Toolbar.Separator />
                <Toolbar.Item asChild>
                    <Button
                        variant="outline"
                        size="md"
                        startIcon={Play}
                        label={labels.start}
                        disabled={info.count === 0 || !info.canStart}
                        onClick={handleStart}
                        data-testid="BrowseToolbar.Start"
                    />
                </Toolbar.Item>
                <Toolbar.Item asChild>
                    <Button
                        variant="outline"
                        size="md"
                        startIcon={Square}
                        label={labels.stop}
                        disabled={info.count === 0 || !info.canStop}
                        onClick={handleStop}
                        data-testid="BrowseToolbar.Stop"
                    />
                </Toolbar.Item>
                <div className="flex-1" />
                <Toolbar.Item asChild>
                    <Button
                        variant="text"
                        size="md"
                        startIcon={RefreshCw}
                        label={labels.refresh}
                        onClick={handleRefresh}
                        data-testid="BrowseToolbar.Refresh"
                    />
                </Toolbar.Item>
            </Toolbar.Container>
        </Toolbar>
    );
};

BrowseToolbar.displayName = 'BrowseToolbar';
