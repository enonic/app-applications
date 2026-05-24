import {Button, Dialog, SearchField, Tab} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import {Download} from 'lucide-react';
import type {ReactElement} from 'react';
import {useState} from 'react';
import {installApplicationFromUrl} from '../../features/install-app/api/install';
import {useI18n} from '../../shared/i18n/useI18n';
import {pushToast} from '../../shared/ui/toaster/store/notifications';
import {$dialogs, closeInstallDialog} from '../../pages/applications/store/dialogs';
import {$market, resetMarket, setQuery} from '../../features/install-app/store/market-search';
import {MarketGrid} from './MarketGrid';
import {UploadDropZone} from './UploadDropZone';

const URL_PATTERN = /^https?:\/\/\S+$/i;

type InstallTab = 'apps' | 'upload';

/**
 * Replaces the legacy `InstallAppDialog`. Mirrors the layout of CS's
 * `NewContentDialog`: a shared `SearchField` above two tabs — `Applications`
 * (Enonic Market list) and `Upload` (drag-and-drop / file picker). When the
 * search input is a URL, the trailing "Install from URL" action lets the user
 * install straight from a download link.
 */
export const InstallDialog = (): ReactElement => {
    const open = useStore($dialogs).install;
    const {query} = useStore($market);
    const [selectedTab, setSelectedTab] = useState<InstallTab>('apps');
    const [urlBusy, setUrlBusy] = useState(false);

    const title = useI18n('dialog.install');
    const searchPlaceholder = useI18n('dialog.install.search');
    const appsTabLabel = useI18n('dialog.install.tab.apps');
    const uploadTabLabel = useI18n('dialog.install.tab.upload');
    const urlInstallLabel = useI18n('dialog.install.url.install');
    const installFailedLabel = useI18n('notify.error.installFailed');

    const trimmed = query.trim();
    const isUrl = URL_PATTERN.test(trimmed);

    const handleOpenChange = (next: boolean): void => {
        if (next) return;
        closeInstallDialog();
        setQuery('');
        setSelectedTab('apps');
    };

    const handleUrlInstall = async (): Promise<void> => {
        if (!isUrl || urlBusy) return;
        setUrlBusy(true);
        try {
            await installApplicationFromUrl(trimmed);
            setQuery('');
        } catch (cause) {
            const detail = cause instanceof Error ? cause.message : String(cause);
            pushToast({tone: 'error', message: `${installFailedLabel}: ${detail}`});
        } finally {
            setUrlBusy(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.Content
                    className="h-178 w-200 max-w-auto flex flex-col"
                    data-component="InstallDialog"
                >
                    <Tab.Root
                        value={selectedTab}
                        onValueChange={(value) => setSelectedTab(value as InstallTab)}
                        className="flex flex-col h-full gap-2.5"
                    >
                        <Dialog.Header className="flex flex-col gap-2.5">
                            <Dialog.DefaultHeader title={title} />
                            <div className="flex items-center gap-2">
                                <SearchField
                                    value={query}
                                    onChange={setQuery}
                                    placeholder={searchPlaceholder}
                                    className="flex-1"
                                    data-component="InstallDialog.Search"
                                >
                                    <SearchField.Icon />
                                    <SearchField.Input />
                                    <SearchField.Clear />
                                </SearchField>
                                {isUrl ? (
                                    <Button
                                        variant="solid"
                                        size="md"
                                        startIcon={Download}
                                        label={urlInstallLabel}
                                        disabled={urlBusy}
                                        onClick={() => {
                                            void handleUrlInstall();
                                        }}
                                        data-component="InstallDialog.UrlInstall"
                                    />
                                ) : null}
                            </div>
                            <Tab.List>
                                <Tab.Trigger value="apps">{appsTabLabel}</Tab.Trigger>
                                <Tab.Trigger value="upload">{uploadTabLabel}</Tab.Trigger>
                            </Tab.List>
                        </Dialog.Header>

                        <Dialog.Body className="flex flex-col flex-1 min-h-0">
                            <Tab.Content
                                value="apps"
                                className="flex flex-col flex-1 min-h-0 overflow-y-auto"
                            >
                                <MarketGrid />
                            </Tab.Content>
                            <Tab.Content value="upload" className="flex flex-1 min-h-0">
                                <UploadDropZone />
                            </Tab.Content>
                        </Dialog.Body>
                    </Tab.Root>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );
};

InstallDialog.displayName = 'InstallDialog';

/**
 * Exposed for tests / external callers that need to reset the market cache,
 * e.g. when switching the active XP version.
 */
export function clearMarketCache(): void {
    resetMarket();
}
