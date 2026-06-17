import {$notifications} from './notifications.store';
import type {NotificationItem, PushToastInput} from './notifications.types';

const DEFAULT_DURATION_MS = 5_000;

let counter = 0;

function nextId(): string {
    counter += 1;
    return `toast-${counter}`;
}

/**
 * Pushes a toast onto the notification stack. Returns the generated id so callers
 * can dismiss programmatically (e.g. when a long-running operation finishes).
 */
export function pushToast(input: PushToastInput): string {
    const item: NotificationItem = {
        id: nextId(),
        tone: input.tone,
        message: input.message,
        title: input.title,
        duration: input.duration ?? DEFAULT_DURATION_MS,
    };
    $notifications.set([...$notifications.get(), item]);
    return item.id;
}

/** Removes a single toast by id. No-op when the id is unknown. */
export function dismissToast(id: string): void {
    const next = $notifications.get().filter((n) => n.id !== id);
    if (next.length === $notifications.get().length) return;
    $notifications.set(next);
}

/** Drops every active toast and resets the internal id counter. Used by tests. */
export function resetNotifications(): void {
    $notifications.set([]);
    counter = 0;
}
