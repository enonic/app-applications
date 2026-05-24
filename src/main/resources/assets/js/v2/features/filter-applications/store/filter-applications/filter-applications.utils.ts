import {$filter, initialFilterState} from './filter-applications.store';

/** Sets the free-text filter used by `$visibleApps`. */
export function setFilter(filter: string): void {
    $filter.setKey('filter', filter);
}

/** Toggles whether system-reserved applications are excluded from `$visibleApps`. */
export function setHideSystem(hide: boolean): void {
    $filter.setKey('hideSystem', hide);
}

/** Resets the filter to its initial empty state. */
export function resetFilter(): void {
    $filter.set(initialFilterState());
}
