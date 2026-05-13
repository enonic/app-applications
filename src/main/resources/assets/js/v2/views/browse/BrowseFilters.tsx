import {SearchField, Toggle} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import {Cog} from 'lucide-react';
import type {ReactElement} from 'react';
import {useI18n} from '../../features/hooks/useI18n';
import {$applications, setFilter, setHideSystem} from '../../features/store/applications.store';

/**
 * Filter strip beneath the toolbar: free-text search + hide-system-apps toggle.
 * Both controls are controlled inputs bound to `$applications.{filter,hideSystem}`.
 */
export const BrowseFilters = (): ReactElement => {
    const {filter, hideSystem} = useStore($applications);

    const searchPlaceholder = useI18n('field.search.placeholder');
    const hideLabel = useI18n('action.hideSystemApps');
    const showLabel = useI18n('action.showSystemApps');
    const toggleLabel = hideSystem ? showLabel : hideLabel;

    return (
        <div className="flex items-center gap-3 px-5 py-3 border-b border-bdr-soft bg-surface-primary">
            <SearchField
                value={filter}
                onChange={setFilter}
                placeholder={searchPlaceholder}
                className="flex-1 max-w-150"
                data-testid="BrowseFilters.Search"
            >
                <SearchField.Icon />
                <SearchField.Input />
                <SearchField.Clear />
            </SearchField>
            <Toggle
                pressed={hideSystem}
                onPressedChange={setHideSystem}
                variant="outline"
                size="md"
                startIcon={Cog}
                label={toggleLabel}
                title={toggleLabel}
                data-testid="BrowseFilters.HideSystem"
            />
        </div>
    );
};

BrowseFilters.displayName = 'BrowseFilters';
