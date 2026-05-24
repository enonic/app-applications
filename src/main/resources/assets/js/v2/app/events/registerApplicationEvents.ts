import {ApplicationEvent} from '@enonic/lib-admin-ui/application/ApplicationEvent';
import {handleApplicationEvent} from './handleApplicationEvent';

let registered = false;

/**
 * Subscribes the WebSocket → store bridge for `ApplicationEvent`. Idempotent;
 * safe to call from multiple modules during boot.
 *
 * The actual WebSocket lifecycle is owned by `ServerEventsListener` in `main.ts`.
 */
export function registerApplicationEvents(): void {
    if (registered) return;
    registered = true;
    ApplicationEvent.on((event) => {
        void handleApplicationEvent(event);
    });
}
