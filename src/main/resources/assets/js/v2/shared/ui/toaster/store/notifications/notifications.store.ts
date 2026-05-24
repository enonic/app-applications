import {atom, computed} from 'nanostores';
import type {NotificationItem} from './notifications.types';

export const $notifications = atom<NotificationItem[]>([]);

/** True when at least one toast is on the stack. */
export const $hasToasts = computed($notifications, (items) => items.length > 0);
