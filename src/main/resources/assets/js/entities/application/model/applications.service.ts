import { HUB_TOPICS, subscribeTopic, toApplicationsMessage } from '../../../shared/admin-events';
import { invalidateApplicationInfo } from './application-info.store';
import { loadApplication, loadApplications } from './applications.load';
import { isApplicationsCached, removeApplication } from './applications.store';

export type ApplicationChange = {
  kind: 'installed' | 'uninstalled' | 'changed';
  key: string;
};

let unsubscribe: (() => void) | undefined;

/**
 * Reads an application lifecycle change out of a hub message, however it was caused — this section,
 * another admin, a jar dropped in the deploy folder. STARTING/STOPPING and the resolver states are
 * transient and each is followed by a terminal event, so only the terminal ones count.
 */
export function toApplicationChange(data: unknown): ApplicationChange | undefined {
  const message = toApplicationsMessage(data);
  const key = message?.key;
  if (message == null || key == null) {
    return undefined;
  }

  switch (message.eventType) {
    case 'INSTALLED':
      return { kind: 'installed', key };
    case 'UNINSTALLED':
      return { kind: 'uninstalled', key };
    case 'STARTED':
    case 'STOPPED':
    case 'UPDATED':
      return { kind: 'changed', key };
    default:
      return undefined;
  }
}

export function start(): void {
  if (unsubscribe != null) {
    return;
  }

  unsubscribe = subscribeTopic(HUB_TOPICS.applications, {
    onMessage: handleMessage,
    onLoss: reloadCachedList,
  });
}

export function stop(): void {
  unsubscribe?.();
  unsubscribe = undefined;
}

// *
// * Internal
// *
function handleMessage(data: unknown): void {
  const change = toApplicationChange(data);
  if (change == null) {
    return;
  }

  invalidateApplicationInfo(change.key);

  switch (change.kind) {
    case 'installed':
      reloadCachedList();
      return;
    case 'uninstalled':
      removeApplication(change.key);
      return;
    case 'changed':
      void loadApplication(change.key);
      return;
  }
}

function reloadCachedList(): void {
  if (isApplicationsCached()) {
    void loadApplications();
  }
}
