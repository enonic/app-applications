import {ContextMenu} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import type {ReactElement, ReactNode} from 'react';
import {startSelectedApplications, stopSelectedApplications} from '../../features/change-application-state';
import {$selection, $selectionInfo} from '../../pages/applications/store/selection';
import {openInstallDialog, openUninstallConfirm} from '../../pages/applications/store/dialogs';
import {$isReadonly} from '../../shared/config/readonly';
import {useI18n} from '../../shared/i18n/useI18n';

interface Props {
    children: ReactNode;
}

/**
 * Wraps the browse grid in a right-click `ContextMenu` whose entries operate on
 * the *current* selection. The menu is always mounted; entries disable themselves
 * when the selection cannot accept the action.
 */
export const BrowseContextMenu = ({children}: Props): ReactElement => {
    const info = useStore($selectionInfo);
    const readonly = useStore($isReadonly);
    const installLabel = useI18n('action.install');
    const startLabel = useI18n('action.start');
    const stopLabel = useI18n('action.stop');
    const uninstallLabel = useI18n('action.uninstall');

    if (readonly) {
        return <>{children}</>;
    }

    const hasSelection = info.count > 0;

    const handleInstall = (): void => {
        openInstallDialog();
    };

    const handleStart = (): void => {
        startSelectedApplications($selection.get());
    };

    const handleStop = (): void => {
        stopSelectedApplications($selection.get());
    };

    const handleUninstall = (): void => {
        const keys = $selection.get();
        if (keys.length === 0) return;
        openUninstallConfirm(keys);
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
