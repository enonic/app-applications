import {
  createAdminEvents,
  type AdminEvents,
  type TopicHandlers,
} from '@enonic/ui-utils/admin-events';

type EarlySubscription = { topic: string; handlers: TopicHandlers; unsubscribe?: () => void };

let adminEvents: AdminEvents | undefined;

// ! The services subscribe on the first mount, before the bootstrap knows the hub's url, so a
// ! subscription taken that early waits here and is handed over once the hub exists.
const early = new Set<EarlySubscription>();

/** One hub per module: the url arrives with the bootstrap, and a later call only retries a failed load. */
export function connectAdminEvents(url: string): void {
  if (adminEvents === undefined) {
    const events = createAdminEvents(url);
    early.forEach((entry) => {
      entry.unsubscribe = events.subscribeTopic(entry.topic, entry.handlers);
    });
    early.clear();
    adminEvents = events;
  }
  adminEvents.connect();
}

export function subscribeTopic(topic: string, handlers: TopicHandlers): () => void {
  if (adminEvents !== undefined) {
    return adminEvents.subscribeTopic(topic, handlers);
  }

  const entry: EarlySubscription = { topic, handlers };
  early.add(entry);

  return () => {
    early.delete(entry);
    entry.unsubscribe?.();
  };
}
