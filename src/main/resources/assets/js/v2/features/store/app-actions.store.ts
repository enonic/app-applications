import {computed, map} from 'nanostores';

//
// * Types
//

export interface ProgressJson {
    /** Application key the progress belongs to. */
    key: string;
    /** Progress percentage 0..100. `undefined` when indeterminate. */
    progress?: number;
    /** Optional human-readable status, e.g. "Downloading", "Installing". */
    label?: string;
}

interface AppActionsStore {
    installing: Record<string, ProgressJson>;
    starting: Set<string>;
    stopping: Set<string>;
}

//
// * Store state
//

export const $appActions = map<AppActionsStore>(initialState());

function initialState(): AppActionsStore {
    return {
        installing: {},
        starting: new Set(),
        stopping: new Set(),
    };
}

//
// * Mutators
//

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
    $appActions.set(initialState());
}

//
// * Derived state
//

/** True when at least one install is in progress. Drives the global install indicator. */
export const $isInstalling = computed($appActions, (a) => Object.keys(a.installing).length > 0);

/**
 * Returns true when the given application key has any in-flight action
 * (install, start, or stop).
 */
export function isPending(key: string): boolean {
    const {installing, starting, stopping} = $appActions.get();
    return key in installing || starting.has(key) || stopping.has(key);
}
