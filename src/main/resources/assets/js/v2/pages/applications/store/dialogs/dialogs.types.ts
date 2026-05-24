export interface UninstallConfirmState {
    open: boolean;
    keys: string[];
}

export interface DialogsState {
    install: boolean;
    uninstallConfirm: UninstallConfirmState;
}
