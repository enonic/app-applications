import {computed, map} from 'nanostores';
import {type ApplicationDto, isStarted, isStopped} from '../types/application';
import {type ApplicationInfoDto} from '../types/application-info';

//
// * Types
//

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error';

interface ApplicationsStore {
    items: ApplicationDto[];
    byKey: Record<string, ApplicationDto>;
    infoByKey: Record<string, ApplicationInfoDto>;
    status: LoadStatus;
    filter: string;
    hideSystem: boolean;
    selection: string[];
}

export interface SelectionInfo {
    count: number;
    canStart: boolean;
    canStop: boolean;
    canUninstall: boolean;
    anySystem: boolean;
}

//
// * Store state
//

export const $applications = map<ApplicationsStore>(initialState());

function initialState(): ApplicationsStore {
    return {
        items: [],
        byKey: {},
        infoByKey: {},
        status: 'idle',
        filter: '',
        hideSystem: false,
        selection: [],
    };
}

//
// * Mutators
//

/** Replaces the full list of applications, rebuilds the `byKey` index, and prunes orphan selections / cached info. */
export function setApplications(items: ApplicationDto[]): void {
    const sorted = [...items].sort((a, b) => a.displayName.localeCompare(b.displayName));
    const byKey: Record<string, ApplicationDto> = {};
    for (const item of sorted) {
        byKey[item.key] = item;
    }

    const {selection: currentSelection, infoByKey: currentInfo} = $applications.get();
    const selection = currentSelection.filter((key) => key in byKey);
    const infoByKey: Record<string, ApplicationInfoDto> = {};
    for (const [k, v] of Object.entries(currentInfo)) {
        if (k in byKey) infoByKey[k] = v;
    }

    $applications.set({
        ...$applications.get(),
        items: sorted,
        byKey,
        infoByKey,
        selection,
    });
}

/** Inserts or replaces a single application by key. */
export function upsertApplication(dto: ApplicationDto): void {
    const {items, byKey} = $applications.get();
    const next = byKey[dto.key]
        ? items.map((it) => (it.key === dto.key ? dto : it))
        : [...items, dto].sort((a, b) => a.displayName.localeCompare(b.displayName));

    $applications.set({
        ...$applications.get(),
        items: next,
        byKey: {...byKey, [dto.key]: dto},
    });
}

/** Removes one or more applications by key and drops them from the current selection. */
export function removeApplications(keys: string[]): void {
    if (keys.length === 0) return;

    const dropped = new Set(keys);
    const {items, byKey, infoByKey, selection} = $applications.get();

    const nextItems = items.filter((it) => !dropped.has(it.key));
    const nextByKey: Record<string, ApplicationDto> = {};
    for (const [k, v] of Object.entries(byKey)) {
        if (!dropped.has(k)) nextByKey[k] = v;
    }
    const nextInfoByKey: Record<string, ApplicationInfoDto> = {};
    for (const [k, v] of Object.entries(infoByKey)) {
        if (!dropped.has(k)) nextInfoByKey[k] = v;
    }

    $applications.set({
        ...$applications.get(),
        items: nextItems,
        byKey: nextByKey,
        infoByKey: nextInfoByKey,
        selection: selection.filter((k) => !dropped.has(k)),
    });
}

/** Caches the resolved info for one application. Overwrites any previous entry. */
export function setApplicationInfo(key: string, info: ApplicationInfoDto): void {
    const {infoByKey} = $applications.get();
    $applications.setKey('infoByKey', {...infoByKey, [key]: info});
}

/** Sets the load status reported by the data layer. */
export function setStatus(status: LoadStatus): void {
    $applications.setKey('status', status);
}

/** Sets the free-text filter used by `$visibleApps`. */
export function setFilter(filter: string): void {
    $applications.setKey('filter', filter);
}

/** Toggles whether system-reserved applications are excluded from `$visibleApps`. */
export function setHideSystem(hide: boolean): void {
    $applications.setKey('hideSystem', hide);
}

/** Replaces the current selection (existing keys only — unknown keys are dropped). */
export function setSelection(keys: string[]): void {
    const {byKey} = $applications.get();
    const sanitized = keys.filter((k) => k in byKey);
    $applications.setKey('selection', sanitized);
}

/** Empties the current selection. */
export function clearSelection(): void {
    $applications.setKey('selection', []);
}

/** Resets the store to its initial empty state. */
export function resetApplications(): void {
    $applications.set(initialState());
}

//
// * Derived state
//

/**
 * Apps visible after applying the current text filter and the hide-system-apps toggle.
 * Filter matches `displayName`, `name`, `vendorName`, or `description` case-insensitively.
 */
export const $visibleApps = computed($applications, ({items, filter, hideSystem}) => {
    const needle = filter.trim().toLowerCase();
    const base = hideSystem ? items.filter((it) => !it.system) : items;
    if (!needle) return base;

    return base.filter((it) => {
        return (
            it.displayName.toLowerCase().includes(needle) ||
            it.name.toLowerCase().includes(needle) ||
            it.vendorName.toLowerCase().includes(needle) ||
            it.description.toLowerCase().includes(needle)
        );
    });
});

/**
 * Aggregate flags about the current selection. Designed to drive toolbar disabled
 * states without consumers iterating the selection themselves.
 */
export const $selectionInfo = computed($applications, ({selection, byKey}): SelectionInfo => {
    const selected = selection.map((k) => byKey[k]).filter((it): it is ApplicationDto => Boolean(it));

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
