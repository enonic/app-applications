import {Dialog, SearchField} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import type {ReactElement} from 'react';
import {useI18n} from '../../features/hooks/useI18n';
import {$dialogs, closeInstallDialog} from '../../features/store/dialogs.store';
import {$market, resetMarket, setQuery} from '../../features/store/market.store';
import {MarketGrid} from './MarketGrid';
import {UploadDropZone} from './UploadDropZone';
import {UrlInstallRow} from './UrlInstallRow';

/**
 * Replaces the legacy `InstallAppDialog`. Three independent install paths:
 *
 * 1. `UrlInstallRow` — paste a download URL and click Install.
 * 2. `UploadDropZone` — drag-and-drop / browse a `.jar` or `.zip`.
 * 3. `MarketGrid` — pick from the Enonic Market catalog.
 *
 * Open state is owned by `$dialogs.install`. On close the market query is
 * cleared so the next open starts fresh; the cached items remain in `$market`
 * (loaded once per session) to avoid re-fetching when the dialog is reopened.
 */
export const InstallDialog = (): ReactElement => {
    const open = useStore($dialogs).install;
    const {query} = useStore($market);

    const title = useI18n('dialog.install');
    const searchPlaceholder = useI18n('dialog.install.search');

    const handleOpenChange = (next: boolean): void => {
        if (next) return;
        closeInstallDialog();
        setQuery('');
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.Content
                    className="flex flex-col max-w-200 w-full max-h-[80vh]"
                    data-testid="InstallDialog"
                >
                    <Dialog.DefaultHeader title={title} />
                    <Dialog.Body className="flex flex-col gap-4 overflow-hidden">
                        <UrlInstallRow />
                        <UploadDropZone />
                        <SearchField
                            value={query}
                            onChange={setQuery}
                            placeholder={searchPlaceholder}
                            data-testid="InstallDialog.Search"
                        >
                            <SearchField.Icon />
                            <SearchField.Input />
                            <SearchField.Clear />
                        </SearchField>
                        <MarketGrid />
                    </Dialog.Body>
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
