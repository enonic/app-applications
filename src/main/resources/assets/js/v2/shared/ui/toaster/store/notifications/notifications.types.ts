export type NotificationTone = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
    id: string;
    tone: NotificationTone;
    message: string;
    title?: string;
    /** Auto-hide delay in ms; `0` keeps the toast until dismissed manually. Defaults to 5s. */
    duration: number;
}

export interface PushToastInput {
    tone: NotificationTone;
    message: string;
    title?: string;
    /** Auto-hide delay in ms; `0` keeps the toast until dismissed manually. */
    duration?: number;
}
