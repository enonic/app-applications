import {Checkbox, Toggle, Tooltip} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import {Cog} from 'lucide-react';
import type {ReactElement} from 'react';
import {$filter, $visibleApps, setHideSystem} from '../../features/filter-applications';
import {$selection, setSelection} from '../../pages/applications/store/selection';
import {useI18n} from '../../shared/i18n/useI18n';

/**
 * Header strip directly above the list. Holds the master "Select all" checkbox,
 * a counter and the System-apps filter toggle on the right.
 *
 * 56px tall to match the actions toolbar and detail-panel header.
 */
export const BrowseFilters = (): ReactElement => {
    const {hideSystem} = useStore($filter);
    const selection = useStore($selection);
    const items = useStore($visibleApps);

    const selectAllLabel = useI18n('action.selectAll');
    const hideLabel = useI18n('action.hideSystemApps');
    const showLabel = useI18n('action.showSystemApps');
    const toggleLabel = hideSystem ? showLabel : hideLabel;

    const total = items.length;
    const selectedVisible = selection.filter((k) => items.some((it) => it.key === k)).length;
    const allSelected = total > 0 && selectedVisible === total;
    const someSelected = selectedVisible > 0 && selectedVisible < total;
    const counterLabel = useI18n(total === 1 ? 'field.applications.one' : 'field.applications');

    const handleSelectAll = (): void => {
        if (allSelected) {
            setSelection([]);
            return;
        }
        setSelection(items.map((it) => it.key));
    };

    return (
        <div className="flex items-center gap-3 px-5 h-14 border-b border-bdr-soft bg-surface-neutral shrink-0">
            <Checkbox
                checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                onCheckedChange={handleSelectAll}
                label={selectAllLabel}
                className="text-base"
                data-component="BrowseFilters.SelectAll"
            />
            <div className="flex-1" />
            <span className="text-sm text-subtle tabular-nums" data-component="BrowseFilters.Count">
                {total} {counterLabel}
            </span>
            <Tooltip delay={300} value={toggleLabel} asChild>
                <Toggle
                    variant="filled"
                    size="sm"
                    className="size-9 p-0"
                    startIcon={Cog}
                    pressed={!hideSystem}
                    onPressedChange={(pressed) => setHideSystem(!pressed)}
                    aria-label={toggleLabel}
                    data-component="BrowseFilters.SystemToggle"
                />
            </Tooltip>
        </div>
    );
};

BrowseFilters.displayName = 'BrowseFilters';
