import type {ReactElement} from 'react';

interface Props {
    items: string[];
}

/**
 * Comma-separated inline list. Matches the legacy `ItemDataGroup.addDataArray`
 * layout, which packs an array of strings as wrapped pills with `, ` separators.
 */
export const NameList = ({items}: Props): ReactElement | null => {
    if (items.length === 0) return null;
    return (
        <span className="text-main">
            {items.map((name, idx) => (
                <span key={`${name}-${idx}`}>
                    {idx > 0 ? ', ' : ''}
                    {name}
                </span>
            ))}
        </span>
    );
};

NameList.displayName = 'DetailPanel.NameList';
