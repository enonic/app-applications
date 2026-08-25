import { h, render } from 'preact';

import { App } from './app/App';
import { bootstrap } from './app/bootstrap';
import type { MountOptions, Unmount } from './shared/sections';

/** Renders the section into the container the host owns, inside the shadow root it created. */
export function mount({ container, host }: MountOptions): Unmount {
  // ! Not awaited. `mount` owes the shell its disposer synchronously, so the section paints while its
  // ! own configuration is still in flight and `$bootstrap` is what moves it on.
  void bootstrap(host);

  render(h(App, { host }), container);

  return () => render(null, container);
}
