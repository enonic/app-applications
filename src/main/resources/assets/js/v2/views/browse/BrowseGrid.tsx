import {GridList, cn} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import type {JSX} from 'preact';
import type {ReactElement} from 'react';
import {useCallback, useMemo} from 'react';
import type {ApplicationDto} from '../../features/types/application';
import {$applications, $visibleApps, setSelection} from '../../features/store/applications.store';
import {BrowseContextMenu} from './BrowseContextMenu';
import {BrowseRow} from './BrowseRow';

/**
 * Grid of installed applications. Renders `$visibleApps` (post-filter), wires
 * multi-select with Cmd/Ctrl + click and Shift + click, and wraps the whole
 * grid in a single `ContextMenu` that reads the current selection.
 */
export const BrowseGrid = (): ReactElement => {
    const items = useStore($visibleApps);
    const selection = useStore($applications).selection;

    const selectionSet = useMemo(() => new Set(selection), [selection]);

    const visibleKeys = useMemo(() => items.map((it) => it.key), [items]);

    const handleRowClick = useCallback(
        (key: string, event: JSX.TargetedMouseEvent<HTMLDivElement>) => {
            const multi = event.ctrlKey || event.metaKey;
            const range = event.shiftKey;

            if (range && selection.length > 0) {
                const last = selection[selection.length - 1];
                const startIdx = visibleKeys.indexOf(last);
                const endIdx = visibleKeys.indexOf(key);
                if (startIdx >= 0 && endIdx >= 0) {
                    const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
                    setSelection(visibleKeys.slice(from, to + 1));
                    return;
                }
            }

            if (multi) {
                const next = selectionSet.has(key)
                    ? selection.filter((k) => k !== key)
                    : [...selection, key];
                setSelection(next);
                return;
            }

            setSelection([key]);
        },
        [selection, selectionSet, visibleKeys],
    );

    if (items.length === 0) {
        return (
            <div
                className="flex-1 flex items-center justify-center text-subtle text-sm py-10"
                data-testid="BrowseGrid.Empty"
            >
                No applications found.
            </div>
        );
    }

    return (
        <BrowseContextMenu>
            <GridList
                label="Installed applications"
                className="flex-1 min-h-0 overflow-auto"
                data-testid="BrowseGrid"
            >
                {items.map((app: ApplicationDto) => {
                    const isSelected = selectionSet.has(app.key);
                    return (
                        <GridList.Row
                            key={app.key}
                            id={app.key}
                            className={cn(
                                'group cursor-pointer hover:bg-surface-neutral-hover transition-highlight',
                                isSelected && 'bg-surface-selected text-alt hover:bg-surface-selected',
                            )}
                            data-tone={isSelected ? 'inverse' : undefined}
                            data-system={app.system || undefined}
                            data-testid="BrowseGrid.Row"
                            onClick={(event) => handleRowClick(app.key, event as unknown as JSX.TargetedMouseEvent<HTMLDivElement>)}
                        >
                            <GridList.Cell className="w-full">
                                <BrowseRow app={app} selected={isSelected} />
                            </GridList.Cell>
                        </GridList.Row>
                    );
                })}
            </GridList>
        </BrowseContextMenu>
    );
};

BrowseGrid.displayName = 'BrowseGrid';
