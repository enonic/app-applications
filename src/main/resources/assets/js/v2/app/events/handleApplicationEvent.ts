import {ApplicationEvent, ApplicationEventType} from '@enonic/lib-admin-ui/application/ApplicationEvent';
import {getApplication} from '../../entities/application/api/applications';
import {
    $applications,
    removeApplications,
    upsertApplication,
} from '../../entities/application/store/applications';
import {
    clearInstalling,
    clearStarting,
    clearStopping,
    markStarting,
    markStopping,
    setInstalling,
} from '../../entities/application/store/operation-status';
import {i18n} from '../../shared/i18n/useI18n';
import {pushToast} from '../../shared/ui/toaster/store/notifications';

/**
 * Routes a single `ApplicationEvent` to the right store mutators. Exported so
 * unit tests can drive the dispatch without binding to the global event bus.
 */
export async function handleApplicationEvent(event: ApplicationEvent): Promise<void> {
    const applicationKey = event.getApplicationKey();
    if (applicationKey == null) return;

    const key = applicationKey.toString();

    switch (event.getEventType()) {
        case ApplicationEventType.INSTALLED: {
            await refetchAndUpsert(key);
            clearInstalling(key);
            const installed = $applications.get().byKey[key];
            pushToast({tone: 'success', message: i18n('notify.installed', installed?.displayName ?? key)});
            return;
        }

        case ApplicationEventType.UNINSTALLED: {
            const removed = $applications.get().byKey[key];
            removeApplications([key]);
            clearInstalling(key);
            pushToast({tone: 'success', message: i18n('notify.uninstalled', removed?.displayName ?? key)});
            return;
        }

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

async function refetchAndUpsert(key: string): Promise<void> {
    try {
        const dto = await getApplication(key);
        upsertApplication(dto);
    } catch {
        // ? The bridge doesn't own error reporting — surface failures via toast/log later.
    }
}
