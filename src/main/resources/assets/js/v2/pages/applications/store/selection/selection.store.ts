import {atom, computed} from 'nanostores';
import {$applications} from '../../../../entities/application/store/applications';
import {type ApplicationDto, isStarted, isStopped} from '../../../../entities/application/types/Application';
import type {SelectionInfo} from './selection.types';

/** Selected application keys at the page level. */
export const $selection = atom<string[]>([]);

/**
 * Aggregate flags about the current selection. Designed to drive toolbar disabled
 * states without consumers iterating the selection themselves.
 */
export const $selectionInfo = computed([$selection, $applications], (selection, applications): SelectionInfo => {
    const {byKey} = applications;
    const selected = selection
        .map((k) => byKey[k])
        .filter((it): it is ApplicationDto => Boolean(it));

    if (selected.length === 0) {
        return {count: 0, canStart: false, canStop: false, canUninstall: false, anySystem: false};
    }

    const anySystem = selected.some((it) => it.system);
    const canStart = selected.length > 0 && selected.every((it) => isStopped(it));
    const canStop = selected.length > 0 && selected.every((it) => isStarted(it));
    const canUninstall = selected.length > 0 && !anySystem && selected.every((it) => !it.system);

    return {
        count: selected.length,
        canStart,
        canStop,
        canUninstall,
        anySystem,
    };
});

// ? Prune selection when applications change (e.g. one was uninstalled). Keeping
// this here makes selection consistent with the entity cache without coupling
// the entity store to selection state.
$applications.subscribe(({byKey}) => {
    const current = $selection.get();
    const pruned = current.filter((k) => k in byKey);
    if (pruned.length !== current.length) {
        $selection.set(pruned);
    }
});
