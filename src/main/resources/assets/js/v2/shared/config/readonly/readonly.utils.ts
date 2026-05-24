import {$readonly} from './readonly.store';

/** Toggles the global read-only mode. */
export function setReadonly(readonly: boolean): void {
    $readonly.set(readonly);
}
