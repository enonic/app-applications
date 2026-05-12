import {computed, map} from 'nanostores';

//
// * Types
//

interface UninstallConfirmState {
    open: boolean;
    keys: string[];
}

interface DialogsStore {
    install: boolean;
    uninstallConfirm: UninstallConfirmState;
}

//
// * Store state
//

export const $dialogs = map<DialogsStore>(initialState());

function initialState(): DialogsStore {
    return {
        install: false,
        uninstallConfirm: {open: false, keys: []},
    };
}

//
// * Mutators
//

/** Opens the install dialog. */
export function openInstallDialog(): void {
    $dialogs.setKey('install', true);
}

/** Closes the install dialog. */
export function closeInstallDialog(): void {
    $dialogs.setKey('install', false);
}

/** Opens the uninstall confirmation dialog with the given app keys. */
export function openUninstallConfirm(keys: string[]): void {
    $dialogs.setKey('uninstallConfirm', {open: true, keys: [...keys]});
}

/** Closes the uninstall confirmation dialog and clears its app keys. */
export function closeUninstallConfirm(): void {
    $dialogs.setKey('uninstallConfirm', {open: false, keys: []});
}

/** Closes every dialog and resets the store to its initial state. */
export function resetDialogs(): void {
    $dialogs.set(initialState());
}

//
// * Derived state
//

/** True when any dialog is open. */
export const $hasOpenDialog = computed($dialogs, ({install, uninstallConfirm}) => install || uninstallConfirm.open);
