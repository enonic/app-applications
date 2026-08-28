import { APPLICATIONS_TOPIC, connectAdminEvents, subscribeTopic } from '../shared/admin-events';

let unsubscribe: (() => void) | undefined;

/**
 * Connects this section to the hub's `applications` topic — the lifecycle feed app-settings owns and
 * publishes. Nothing crosses the mount contract: a section subscribes for itself.
 *
 * ! Started from the bootstrap, so this runs once for the life of the module, as the subscription
 * ! does. It must not hang off a mount: a provider pointing several descriptors at this module would
 * ! have the first unmount tear down the subscription the others are still reading.
 *
 * ? What a message means here is still open; until the browse screen has something to refetch, it is
 * ? only logged.
 */
export function startSectionEvents(eventsUrl: string): void {
  if (unsubscribe != null) {
    return;
  }

  connectAdminEvents(eventsUrl);

  // TODO: Temporary logging until the section decides what a message means to it.
  unsubscribe = subscribeTopic(APPLICATIONS_TOPIC, {
    onMessage: (data) => {
      console.log('applications message:', data);
    },
    onLoss: (count) => {
      console.log('applications loss:', count);
    },
  });
}

/**
 * Nothing in the app calls this — the subscription lives as long as the page. It exists so a test can
 * reset the module, and it detaches handlers only: the platform client's `connect` facade has no
 * unsubscribe, so the hub subscription itself stays until the page reloads.
 */
export function stopSectionEvents(): void {
  unsubscribe?.();
  unsubscribe = undefined;
}
