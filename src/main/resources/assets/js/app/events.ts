import { connectAdminEvents } from '../shared/admin-events';

/**
 * Opens this section's connection to the admin events hub, whose topics app-settings owns and
 * publishes. Nothing crosses the mount contract: a section connects, and subscribes, for itself.
 *
 * ! Called from the bootstrap, so it runs once for the life of the module rather than per mount: a
 * ! provider pointing several descriptors at this module would otherwise reconnect per section. The
 * ! topics themselves are subscribed by the services that care, which start before this resolves —
 * ! the client keeps a handler taken before the connection existed and subscribes it on arrival.
 */
export function startSectionEvents(eventsUrl: string): void {
  connectAdminEvents(eventsUrl);
}
