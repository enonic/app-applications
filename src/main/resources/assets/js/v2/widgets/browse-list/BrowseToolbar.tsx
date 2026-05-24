import {Button, IconButton, Toolbar} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import {Play, Search, Square} from 'lucide-react';
import type {ReactElement} from 'react';
import {useI18n} from '../../shared/i18n/useI18n';
import {startSelectedApplications, stopSelectedApplications} from '../../features/change-application-state';
import {$isReadonly} from '../../shared/config/readonly';
import {$selection, $selectionInfo} from '../../pages/applications/store/selection';
import {openInstallDialog, openUninstallConfirm} from '../../pages/applications/store/dialogs';

/**
 * Actions toolbar above the browse list. Matches the design: 56px tall, search
 * icon on the left, Install/Uninstall as text buttons, Start/Stop with their
 * play/square glyphs. No refresh button on the right.
 */
export const BrowseToolbar = (): ReactElement => {
    const info = useStore($selectionInfo);
    const readonly = useStore($isReadonly);

    const installLabel = useI18n('action.install');
    const uninstallLabel = useI18n('action.uninstall');
    const startLabel = useI18n('action.start');
    const stopLabel = useI18n('action.stop');
    const searchLabel = useI18n('action.search');
    const managedLabel = useI18n('field.managed');
    const managedHelpLabel = useI18n('field.managed.help');

    if (readonly) {
        return (
            <Toolbar>
                <Toolbar.Container
                    aria-label={managedLabel}
                    className="bg-surface-neutral h-14 px-3 flex items-center gap-3 border-b border-bdr-soft"
                >
                    <div className="flex flex-col">
                        <span className="font-semibold">{managedLabel}</span>
                        <small className="text-sm text-subtle">{managedHelpLabel}</small>
                    </div>
                </Toolbar.Container>
            </Toolbar>
        );
    }

    const handleInstall = (): void => {
        openInstallDialog();
    };

    const handleUninstall = (): void => {
        const keys = $selection.get();
        if (keys.length === 0) return;
        openUninstallConfirm(keys);
    };

    const handleStart = (): void => {
        startSelectedApplications($selection.get());
    };

    const handleStop = (): void => {
        stopSelectedApplications($selection.get());
    };

    return (
        <Toolbar>
            <Toolbar.Container
                aria-label={installLabel}
                className="bg-surface-neutral h-14 px-3 flex items-center gap-1 border-b border-bdr-soft"
            >
                <Toolbar.Item asChild>
                    <IconButton
                        variant="text"
                        size="sm"
                        icon={Search}
                        title={searchLabel}
                        data-testid="BrowseToolbar.Search"
                    />
                </Toolbar.Item>
                <Toolbar.Item asChild>
                    <Button
                        variant="text"
                        size="sm"
                        label={installLabel}
                        onClick={handleInstall}
                        data-testid="BrowseToolbar.Install"
                    />
                </Toolbar.Item>
                <Toolbar.Item asChild>
                    <Button
                        variant="text"
                        size="sm"
                        label={uninstallLabel}
                        disabled={info.count === 0 || !info.canUninstall}
                        onClick={handleUninstall}
                        data-testid="BrowseToolbar.Uninstall"
                    />
                </Toolbar.Item>
                <Toolbar.Item asChild>
                    <Button
                        variant="text"
                        size="sm"
                        startIcon={Play}
                        label={startLabel}
                        disabled={info.count === 0 || !info.canStart}
                        onClick={handleStart}
                        data-testid="BrowseToolbar.Start"
                    />
                </Toolbar.Item>
                <Toolbar.Item asChild>
                    <Button
                        variant="text"
                        size="sm"
                        startIcon={Square}
                        label={stopLabel}
                        disabled={info.count === 0 || !info.canStop}
                        onClick={handleStop}
                        data-testid="BrowseToolbar.Stop"
                    />
                </Toolbar.Item>
            </Toolbar.Container>
        </Toolbar>
    );
};

BrowseToolbar.displayName = 'BrowseToolbar';
