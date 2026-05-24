import {$dialogs, initialDialogsState} from './dialogs.store';

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
    $dialogs.set(initialDialogsState());
}
