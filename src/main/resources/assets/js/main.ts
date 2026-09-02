import { h, render } from 'preact';

import { App } from './app/App';
import { bootstrap } from './app/bootstrap';
import { startApplicationsService, stopApplicationsService } from './entities/application';
import { startMarketService, stopMarketService } from './entities/market';
import { startInstallService, stopInstallService } from './features/install-applications';
import { setHost } from './shared/host';
import { startRouting } from './shared/routing';
import type { MountOptions, Unmount } from './shared/sections';

/** Renders the section into the container the host owns, inside the shadow root it created. */
export function mount({ container, host }: MountOptions): Unmount {
  // ! Not awaited. `mount` owes the shell its disposer synchronously, so the section paints while its
  // ! own configuration is still in flight and `$bootstrap` is what moves it on.
  void bootstrap(host);

  // Before the first render: what a store or a command reaches for, and the url it opened on.
  const releaseHost = setHost(host);
  const stopRouting = startRouting(host);

  // ! Subscribed before the hub connection the bootstrap opens, which is deliberate: the client keeps
  // ! a handler taken this early and subscribes its topic the moment it connects.
  startApplicationsService();
  startMarketService();
  startInstallService();

  render(h(App, { host }), container);

  // ! Unrendered first, so nothing is reading the url or the host by the time they go.
  return () => {
    render(null, container);
    stopInstallService();
    stopMarketService();
    stopApplicationsService();
    stopRouting();
    releaseHost();
  };
}
