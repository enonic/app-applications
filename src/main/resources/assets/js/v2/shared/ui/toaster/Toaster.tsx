import {Toast} from '@enonic/ui';
import {useStore} from '@nanostores/preact';
import type {ReactElement} from 'react';
import {useEffect, useState} from 'react';
import {
    $notifications,
    dismissToast,
    type NotificationItem,
} from './store/notifications';

/**
 * Host that renders every toast on the notification stack. Mounted once at the
 * top of the app tree; positions itself fixed in the top-right corner of the
 * viewport so it sits above legacy AppBar chrome and dialog backdrops.
 *
 * Auto-hide timing is owned per toast item (see `NotificationItem.duration`),
 * with `duration: 0` keeping the toast sticky until the user dismisses it.
 * Hovering pauses the auto-hide timer; leaving resumes it from scratch.
 */
export const Toaster = (): ReactElement | null => {
    const items = useStore($notifications);

    if (items.length === 0) return null;

    return (
        <div
            className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
            data-testid="Toaster"
        >
            {items.map((item) => (
                <div key={item.id} className="pointer-events-auto">
                    <ToasterItem item={item} />
                </div>
            ))}
        </div>
    );
};

Toaster.displayName = 'Toaster';

interface ToasterItemProps {
    item: NotificationItem;
}

const ToasterItem = ({item}: ToasterItemProps): ReactElement => {
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        if (item.duration <= 0 || paused) return undefined;

        const timer = window.setTimeout(() => dismissToast(item.id), item.duration);
        return (): void => window.clearTimeout(timer);
    }, [item.id, item.duration, paused]);

    const handleOpenChange = (open: boolean): void => {
        if (!open) dismissToast(item.id);
    };

    return (
        <div
            onMouseEnter={(): void => setPaused(true)}
            onMouseLeave={(): void => setPaused(false)}
            onFocusCapture={(): void => setPaused(true)}
            onBlurCapture={(): void => setPaused(false)}
        >
            <Toast
                open
                onOpenChange={handleOpenChange}
                withClose
                data-testid={`Toaster.Item.${item.tone}`}
            >
                <Toast.Icon tone={item.tone} />
                {item.title ? <Toast.Title>{item.title}</Toast.Title> : null}
                <Toast.Description>{item.message}</Toast.Description>
            </Toast>
        </div>
    );
};

ToasterItem.displayName = 'Toaster.Item';
