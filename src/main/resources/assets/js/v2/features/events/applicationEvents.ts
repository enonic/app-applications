import {ApplicationEvent, ApplicationEventType} from '@enonic/lib-admin-ui/application/ApplicationEvent';
import {getApplication} from '../api/applications';
import {
    clearInstalling,
    clearStarting,
    clearStopping,
    markStarting,
    markStopping,
    setInstalling,
} from '../store/app-actions.store';
import {removeApplications, upsertApplication} from '../store/applications.store';

//
// * Registration
//

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

//
// * Dispatch
//

/**
 * Routes a single `ApplicationEvent` to the right store mutators. Exported so
 * unit tests can drive the dispatch without binding to the global event bus.
 */
export async function handleApplicationEvent(event: ApplicationEvent): Promise<void> {
    const applicationKey = event.getApplicationKey();
    if (applicationKey == null) return;

    const key = applicationKey.toString();

    switch (event.getEventType()) {
        case ApplicationEventType.INSTALLED:
            await refetchAndUpsert(key);
            clearInstalling(key);
            return;

        case ApplicationEventType.UNINSTALLED:
            removeApplications([key]);
            clearInstalling(key);
            return;

        case ApplicationEventType.STARTING:
            markStarting([key]);
            return;

        case ApplicationEventType.STARTED:
            await refetchAndUpsert(key);
            clearStarting([key]);
            return;

        case ApplicationEventType.STOPPING:
            markStopping([key]);
            return;

        case ApplicationEventType.STOPPED:
            await refetchAndUpsert(key);
            clearStopping([key]);
            return;

        case ApplicationEventType.UPDATED:
        case ApplicationEventType.UNRESOLVED:
            await refetchAndUpsert(key);
            return;

        case ApplicationEventType.PROGRESS:
            setInstalling({key, progress: event.getProgress()});
            return;

        case ApplicationEventType.RESOLVED:
            return;

        default:
            return;
    }
}

//
// * Internals
//

async function refetchAndUpsert(key: string): Promise<void> {
    try {
        const dto = await getApplication(key);
        upsertApplication(dto);
    } catch {
        // ? The bridge doesn't own error reporting — surface failures via toast/log later.
    }
}
