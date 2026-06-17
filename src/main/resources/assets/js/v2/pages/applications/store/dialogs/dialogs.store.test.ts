import {afterEach, describe, expect, it} from 'vitest';
import {
    $dialogs,
    $hasOpenDialog,
    closeInstallDialog,
    closeUninstallConfirm,
    openInstallDialog,
    openUninstallConfirm,
    resetDialogs,
} from './index';

describe('pages/applications/store/dialogs', () => {
    afterEach(() => {
        resetDialogs();
    });

    describe('install dialog', () => {
        it('opens and closes', () => {
            openInstallDialog();
            expect($dialogs.get().install).toBe(true);
            closeInstallDialog();
            expect($dialogs.get().install).toBe(false);
        });
    });

    describe('uninstall confirm', () => {
        it('opens with the given keys', () => {
            openUninstallConfirm(['a', 'b']);
            expect($dialogs.get().uninstallConfirm).toEqual({open: true, keys: ['a', 'b']});
        });

        it('closes and clears keys', () => {
            openUninstallConfirm(['a']);
            closeUninstallConfirm();
            expect($dialogs.get().uninstallConfirm).toEqual({open: false, keys: []});
        });

        it('clones the keys array', () => {
            const keys = ['a'];
            openUninstallConfirm(keys);
            keys.push('b');
            expect($dialogs.get().uninstallConfirm.keys).toEqual(['a']);
        });
    });

    describe('$hasOpenDialog', () => {
        it('is true when install dialog is open', () => {
            openInstallDialog();
            expect($hasOpenDialog.get()).toBe(true);
        });

        it('is true when uninstall confirm is open', () => {
            openUninstallConfirm(['a']);
            expect($hasOpenDialog.get()).toBe(true);
        });

        it('is false when no dialog is open', () => {
            expect($hasOpenDialog.get()).toBe(false);
        });
    });
});
