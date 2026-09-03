import { HUB_TOPICS, subscribeTopic, toApplicationsMessage } from '../../../shared/admin-events';
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

let unsubscribe: (() => void) | undefined;

export function start(): void {
  if (unsubscribe != null) {
    return;
  }

  unsubscribe = subscribeTopic(HUB_TOPICS.applications, {
    onMessage: handleMessage,
    // A gap may have hidden an install, and only a reload can tell — but still not for a catalogue
    // nobody has loaded, which is what keeps a lost message off Enonic Market.
    onLoss: reloadCachedCatalogue,
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
  if (!affectsMarket(data)) {
    return;
  }

  reloadCachedCatalogue();
}

// Nothing ever loaded the catalogue, so there is nothing to keep fresh — and this is the one read
// that leaves the instance.
function reloadCachedCatalogue(): void {
  if (isMarketCached()) {
    void loadMarketApplications();
  }
}
