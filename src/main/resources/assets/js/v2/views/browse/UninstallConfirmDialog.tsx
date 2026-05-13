import {Button, Dialog} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import type {ReactElement} from 'react';
import {useI18n} from '../../features/hooks/useI18n';
import {uninstallApplications} from '../../features/api/applications';
import {$dialogs, closeUninstallConfirm} from '../../features/store/dialogs.store';

/**
 * Confirmation dialog for uninstalling one or more applications. Reads its
 * `(open, keys)` payload from `$dialogs.uninstallConfirm` and calls
 * `uninstallApplications()` on confirm; the resulting `UNINSTALLED` server
 * event removes the items from `$applications`.
 */
export const UninstallConfirmDialog = (): ReactElement => {
    const {uninstallConfirm} = useStore($dialogs);

    const title = useI18n('dialog.uninstall');
    const question = useI18n('dialog.uninstall.question');
    const yesLabel = useI18n('action.yes');
    const noLabel = useI18n('action.no');

    const handleOpenChange = (open: boolean): void => {
        if (!open) closeUninstallConfirm();
    };

    const handleConfirm = (): void => {
        const keys = uninstallConfirm.keys;
        closeUninstallConfirm();
        if (keys.length === 0) return;
        void uninstallApplications(keys);
    };

    return (
        <Dialog open={uninstallConfirm.open} onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay />
                <Dialog.Content className="max-w-150 w-fit min-w-100" data-testid="UninstallConfirmDialog">
                    <Dialog.DefaultHeader title={title} />
                    <Dialog.Body>
                        <p>{question}</p>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.Close asChild>
                            <Button variant="outline" size="lg" label={noLabel} />
                        </Dialog.Close>
                        <Button
                            variant="solid"
                            size="lg"
                            label={yesLabel}
                            onClick={handleConfirm}
                            data-testid="UninstallConfirmDialog.Confirm"
                        />
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog>
    );
};

UninstallConfirmDialog.displayName = 'UninstallConfirmDialog';
