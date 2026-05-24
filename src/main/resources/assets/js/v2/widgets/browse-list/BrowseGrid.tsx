import {TreeList} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import type {ReactElement} from 'react';
import {useCallback, useMemo} from 'react';
import {$visibleApps} from '../../features/filter-applications';
import {$selection, setSelection} from '../../pages/applications/store/selection';
import {useI18n} from '../../shared/i18n/useI18n';
import {BrowseContextMenu} from './BrowseContextMenu';
import {BrowseRow} from './BrowseRow';

/**
 * Browse list. Mirrors the TreeList rendering pattern used by app-contentstudio:
 * a `bg-surface-neutral` container, rows stacked with TreeList's default
 * `gap-y-1.5`, checkbox-driven multi-select via `RowSelectionControl`, and
 * row-click "select single" through TreeList's built-in selection handling.
 */
export const BrowseGrid = (): ReactElement => {
    const items = useStore($visibleApps);
    const selection = useStore($selection);
    const emptyLabel = useI18n('text.noApplications');
    const ariaLabel = useI18n('field.installedApplications');

    const selectionSet = useMemo(() => new Set(selection), [selection]);

    const handleSelectionChange = useCallback((next: ReadonlySet<string>) => {
        setSelection(Array.from(next));
    }, []);

    if (items.length === 0) {
        return (
            <div
                className="flex flex-1 items-center justify-center py-10 text-sm text-subtle"
                data-testid="BrowseGrid.Empty"
            >
                {emptyLabel}
            </div>
        );
    }

    return (
        <BrowseContextMenu>
            <TreeList
                selection={selectionSet}
                onSelectionChange={handleSelectionChange}
                selectionMode="multiple"
                aria-label={ariaLabel}
                className="flex min-h-0 flex-1 flex-col bg-surface-neutral"
                data-testid="BrowseGrid"
            >
                <TreeList.Container className="px-5 py-2.5">
                    {items.map((app) => {
                        const isSelected = selectionSet.has(app.key);
                        return (
                            <TreeList.Row
                                key={app.key}
                                id={app.key}
                                data-system={app.system || undefined}
                                data-testid="BrowseGrid.Row"
                                className="group min-h-12 px-3"
                            >
                                <TreeList.RowLeft>
                                    <TreeList.RowSelectionControl rowId={app.key} />
                                </TreeList.RowLeft>
                                <TreeList.RowContent>
                                    <BrowseRow app={app} selected={isSelected} />
                                </TreeList.RowContent>
                            </TreeList.Row>
                        );
                    })}
                </TreeList.Container>
            </TreeList>
        </BrowseContextMenu>
    );
};

BrowseGrid.displayName = 'BrowseGrid';
