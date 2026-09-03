import { h, render } from 'preact';

import { App } from './app/App';
import { bootstrap } from './app/bootstrap';
import { startApplicationsService, stopApplicationsService } from './entities/application';
import { startMarketService, stopMarketService } from './entities/market';
import { startInstallService, stopInstallService } from './features/install-applications';
import { createHostFrame } from './shared/host';
import type { MountOptions, SectionHost, Unmount } from './shared/sections';

/**
 * ! What lives for the module, not the mount: the host may serve every section of an app from one
 * ! module instance, so the services start with the first mount and stop with the last. This app ships
 * ! one section, so the two coincide — the count is what keeps that a coincidence rather than a rule.
 */
let mounts = 0;

/** Renders the section into the container the host owns, inside the shadow root it created. */
export function mount({ container, host }: MountOptions<SectionHost>): Unmount {
  // ! Not awaited. `mount` owes the shell its disposer synchronously, so the section paints while its
  // ! own configuration is still in flight and `$bootstrap` is what moves it on.
  void bootstrap(host);

  // Everything derived from the host lives on the frame — one per mount, never at module level.
  const frame = createHostFrame(host);

  render(h(App, { frame }), container);

  // ! Counted only once the mount has succeeded: a throw above returns no disposer, so a count taken
  // ! earlier could never come back down and the services would outlive every section.
  if (mounts === 0) {
    // ! Subscribed before the hub connection the bootstrap opens, which is deliberate: the client keeps
    // ! a handler taken this early and subscribes its topic the moment it connects.
    startApplicationsService();
    startMarketService();
    startInstallService();
  }
  mounts += 1;

  return () => {
    // The components go first: their cleanups may still speak to the frame.
    render(null, container);
    frame.dispose();

    mounts -= 1;
    if (mounts === 0) {
      stopInstallService();
      stopMarketService();
      stopApplicationsService();
    }
  };
}
