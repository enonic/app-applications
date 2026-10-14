import type { ReadableAtom } from 'nanostores';

import {
  createTopicReaction,
  HUB_TOPICS,
  subscribeTopic,
  toApplicationsMessage,
  type TopicReaction,
} from '../../../shared/admin-events';
import { loadMarketApplications } from './market.load';
import { isMarketCached } from './market.store';

/**
 * The lifecycle events that leave the catalogue wrong: each moves an installed version, which is what
 * `installedVersion` and `updateAvailable` are resolved from. INSTALLED counts because an install also
 * arrives from an uploaded jar, another operator, or the deploy folder, and none of those reloads.
 */
const STALE_EVENT_TYPES = new Set(['INSTALLED', 'UNINSTALLED', 'UPDATED']);

export function affectsMarket(data: unknown): boolean {
  const message = toApplicationsMessage(data);
  return message != null && STALE_EVENT_TYPES.has(message.eventType);
}

let running: TopicReaction | undefined;

/**
 * Follows the `applications` topic while the section is shown: a burst reloads once, and what happens
 * while it is hidden is dropped for one reload on reveal.
 */
export function start($visible: ReadableAtom<boolean>): void {
  if (running !== undefined) {
    return;
  }

  running = createTopicReaction({
    events: { subscribeTopic },
    topic: HUB_TOPICS.applications,
    // ? Only what leaves the catalogue wrong is kept, so every batch that reaches `apply` reloads.
    parse: (data) => (affectsMarket(data) ? data : undefined),
    visible: $visible,
    apply: reloadCachedCatalogue,
    // A gap may have hidden an install, and only a reload can tell.
    refresh: reloadCachedCatalogue,
  });
  running.start();
}

export function stop(): void {
  running?.stop();
  running = undefined;
}

// *
// * Internal
// *

// Nothing ever loaded the catalogue, so there is nothing to keep fresh — and this is the one read
// that leaves the instance.
function reloadCachedCatalogue(): void {
  if (isMarketCached()) {
    void loadMarketApplications();
  }
}
