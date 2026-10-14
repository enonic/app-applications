import { startApplicationsService, stopApplicationsService } from '../entities/application';
import { startMarketService, stopMarketService } from '../entities/market';
import { startInstallService, stopInstallService } from '../features/install-applications';
import { connectAdminEvents } from '../shared/admin-events';
import { $config } from '../shared/config';

/**
 * Connects this section to the admin events hub, whose topics app-settings owns and publishes, then
 * subscribes the topics its services follow. Nothing crosses the mount contract: a section connects,
 * and subscribes, for itself. The hub is one per page, so a second connect only retries a failed load.
 */
export function startSectionEvents(): void {
  const eventsUrl = $config.get()?.eventsUrl;
  if (eventsUrl == null) {
    return;
  }

  connectAdminEvents(eventsUrl);
  startApplicationsService();
  startMarketService();
  startInstallService();
}

export function stopSectionEvents(): void {
  stopInstallService();
  stopMarketService();
  stopApplicationsService();
}
