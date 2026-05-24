import {computed, map} from 'nanostores';
import type {DialogsState} from './dialogs.types';

function initialState(): DialogsState {
    return {
        install: false,
        uninstallConfirm: {open: false, keys: []},
    };
}

export const $dialogs = map<DialogsState>(initialState());

export {initialState as initialDialogsState};

/** True when any dialog is open. */
export const $hasOpenDialog = computed($dialogs, ({install, uninstallConfirm}) => install || uninstallConfirm.open);
