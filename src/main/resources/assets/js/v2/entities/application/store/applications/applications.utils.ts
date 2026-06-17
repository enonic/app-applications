import type {ApplicationDto} from '../../types/Application';
import type {ApplicationInfoDto} from '../../types/ApplicationInfo';
import {$applications, initialApplicationsState} from './applications.store';
import type {LoadStatus} from './applications.types';

/** Replaces the full list of applications and rebuilds the `byKey` index. */
export function setApplications(items: ApplicationDto[]): void {
    const sorted = [...items].sort((a, b) => a.displayName.localeCompare(b.displayName));
    const byKey: Record<string, ApplicationDto> = {};
    for (const item of sorted) {
        byKey[item.key] = item;
    }

    const {infoByKey: currentInfo} = $applications.get();
    const infoByKey: Record<string, ApplicationInfoDto> = {};
    for (const [k, v] of Object.entries(currentInfo)) {
        if (k in byKey) infoByKey[k] = v;
    }

    $applications.set({
        ...$applications.get(),
        items: sorted,
        byKey,
        infoByKey,
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

/** Removes one or more applications by key. */
export function removeApplications(keys: string[]): void {
    if (keys.length === 0) return;

    const dropped = new Set(keys);
    const {items, byKey, infoByKey} = $applications.get();

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

/** Resets the store to its initial empty state. */
export function resetApplications(): void {
    $applications.set(initialApplicationsState());
}
