import {computed, map} from 'nanostores';
import {$applications} from '../../../../entities/application/store/applications';
import type {FilterState} from './filter-applications.types';

function initialState(): FilterState {
    return {
        filter: '',
        hideSystem: false,
    };
}

export const $filter = map<FilterState>(initialState());

export {initialState as initialFilterState};

/**
 * Apps visible after applying the current text filter and the hide-system-apps toggle.
 * Filter matches `displayName`, `name`, `vendorName`, or `description` case-insensitively.
 */
export const $visibleApps = computed([$applications, $filter], (applications, {filter, hideSystem}) => {
    const needle = filter.trim().toLowerCase();
    const base = hideSystem ? applications.items.filter((it) => !it.system) : applications.items;
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
