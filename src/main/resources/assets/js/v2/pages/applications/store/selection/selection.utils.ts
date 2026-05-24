import {$applications} from '../../../../entities/application/store/applications';
import {$selection} from './selection.store';

/** Replaces the current selection (existing keys only — unknown keys are dropped). */
export function setSelection(keys: string[]): void {
    const {byKey} = $applications.get();
    const sanitized = keys.filter((k) => k in byKey);
    $selection.set(sanitized);
}

/** Empties the current selection. */
export function clearSelection(): void {
    $selection.set([]);
}
