import {beforeEach, describe, expect, it} from 'vitest';
import {
    $dialogs,
    $hasOpenDialog,
    closeInstallDialog,
    closeUninstallConfirm,
    openInstallDialog,
    openUninstallConfirm,
    resetDialogs,
} from './dialogs.store';

describe('dialogs.store', () => {
    beforeEach(() => {
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
        it('opens with a fresh copy of the keys array', () => {
            const input = ['a', 'b'];
            openUninstallConfirm(input);
            input.push('c');

            const state = $dialogs.get().uninstallConfirm;
            expect(state.open).toBe(true);
            expect(state.keys).toEqual(['a', 'b']);
        });

        it('closes and clears keys', () => {
            openUninstallConfirm(['a']);
            closeUninstallConfirm();
            const state = $dialogs.get().uninstallConfirm;
            expect(state.open).toBe(false);
            expect(state.keys).toEqual([]);
        });
    });

    describe('$hasOpenDialog', () => {
        it('is false when no dialog is open', () => {
            expect($hasOpenDialog.get()).toBe(false);
        });

        it('is true when the install dialog is open', () => {
            openInstallDialog();
            expect($hasOpenDialog.get()).toBe(true);
        });

        it('is true when the uninstall confirm is open', () => {
            openUninstallConfirm(['a']);
            expect($hasOpenDialog.get()).toBe(true);
        });
    });
});
