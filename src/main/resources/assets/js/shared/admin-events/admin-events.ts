import {
  createAdminEvents,
  type AdminEvents,
  type TopicHandlers,
} from '@enonic/ui-utils/admin-events';

let adminEvents: AdminEvents | undefined;

/** One hub per page: the sections of this module share it, whichever of them connects first. */
export function connectAdminEvents(url: string): void {
  adminEvents ??= createAdminEvents(url);
  adminEvents.connect();
}

export function subscribeTopic(topic: string, handlers: TopicHandlers): () => void {
  return adminEvents?.subscribeTopic(topic, handlers) ?? (() => {});
}
