import {ContextMenu} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import type {ReactElement, ReactNode} from 'react';
import {useI18n} from '../../features/hooks/useI18n';
import {InstallAppPromptEvent} from '../../../app/installation/InstallAppPromptEvent';
import {startApplications, stopApplications} from '../../features/api/applications';
import {$applications, $selectionInfo} from '../../features/store/applications.store';
import {$app} from '../../features/store/app.store';
import {markStarting, markStopping} from '../../features/store/app-actions.store';
import {openUninstallConfirm} from '../../features/store/dialogs.store';

interface Props {
    children: ReactNode;
}

/**
 * Wraps the browse grid in a right-click `ContextMenu` whose entries operate on
 * the *current* `$applications.selection`. The menu is always mounted; entries
 * disable themselves when the selection cannot accept the action.
 */
export const BrowseContextMenu = ({children}: Props): ReactElement => {
    const info = useStore($selectionInfo);
    const readonly = useStore($app).readonly;
    const installLabel = useI18n('action.install');
    const startLabel = useI18n('action.start');
    const stopLabel = useI18n('action.stop');
    const uninstallLabel = useI18n('action.uninstall');

    if (readonly) {
        return <>{children}</>;
    }

    const selection = $applications.get().selection;
    const hasSelection = info.count > 0;

    const handleInstall = (): void => {
        new InstallAppPromptEvent([]).fire();
    };

    const handleStart = (): void => {
        if (selection.length === 0) return;
        markStarting(selection);
        void startApplications(selection);
    };

    const handleStop = (): void => {
        if (selection.length === 0) return;
        markStopping(selection);
        void stopApplications(selection);
    };

    const handleUninstall = (): void => {
        if (selection.length === 0) return;
        openUninstallConfirm(selection);
    };

    return (
        <ContextMenu>
            <ContextMenu.Trigger asChild>
                <div className="contents">{children}</div>
            </ContextMenu.Trigger>
            <ContextMenu.Portal>
                <ContextMenu.Content className="min-w-44" data-testid="BrowseGrid.ContextMenu">
                    <ContextMenu.Item onSelect={handleInstall}>{installLabel}</ContextMenu.Item>
                    <ContextMenu.Separator />
                    <ContextMenu.Item
                        disabled={!hasSelection || !info.canStart}
                        onSelect={handleStart}
                    >
                        {startLabel}
                    </ContextMenu.Item>
                    <ContextMenu.Item
                        disabled={!hasSelection || !info.canStop}
                        onSelect={handleStop}
                    >
                        {stopLabel}
                    </ContextMenu.Item>
                    <ContextMenu.Separator />
                    <ContextMenu.Item
                        disabled={!hasSelection || !info.canUninstall}
                        onSelect={handleUninstall}
                    >
                        {uninstallLabel}
                    </ContextMenu.Item>
                </ContextMenu.Content>
            </ContextMenu.Portal>
        </ContextMenu>
    );
};

BrowseContextMenu.displayName = 'BrowseContextMenu';
