import {$appActions, initialOperationStatusState} from './operation-status.store';
import type {ProgressJson} from './operation-status.types';

/** Records or updates an install/upgrade in-progress for the given application key. */
export function setInstalling(progress: ProgressJson): void {
    const {installing} = $appActions.get();
    $appActions.setKey('installing', {...installing, [progress.key]: progress});
}

/** Clears the install-in-progress record for an application key. */
export function clearInstalling(key: string): void {
    const {installing} = $appActions.get();
    if (!(key in installing)) return;
    const next = {...installing};
    delete next[key];
    $appActions.setKey('installing', next);
}

/** Adds keys to the `starting` set. */
export function markStarting(keys: string[]): void {
    if (keys.length === 0) return;
    const next = new Set($appActions.get().starting);
    for (const k of keys) next.add(k);
    $appActions.setKey('starting', next);
}

/** Removes keys from the `starting` set. */
export function clearStarting(keys: string[]): void {
    if (keys.length === 0) return;
    const next = new Set($appActions.get().starting);
    for (const k of keys) next.delete(k);
    $appActions.setKey('starting', next);
}

/** Adds keys to the `stopping` set. */
export function markStopping(keys: string[]): void {
    if (keys.length === 0) return;
    const next = new Set($appActions.get().stopping);
    for (const k of keys) next.add(k);
    $appActions.setKey('stopping', next);
}

/** Removes keys from the `stopping` set. */
export function clearStopping(keys: string[]): void {
    if (keys.length === 0) return;
    const next = new Set($appActions.get().stopping);
    for (const k of keys) next.delete(k);
    $appActions.setKey('stopping', next);
}

/** Resets all in-flight actions. */
export function resetAppActions(): void {
    $appActions.set(initialOperationStatusState());
}

/**
 * Returns true when the given application key has any in-flight action
 * (install, start, or stop).
 */
export function isPending(key: string): boolean {
    const {installing, starting, stopping} = $appActions.get();
    return key in installing || starting.has(key) || stopping.has(key);
}
