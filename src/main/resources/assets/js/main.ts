import { h, render } from 'preact';

import { App } from './app/App';
import { bootstrap } from './app/bootstrap';
import { createHostFrame } from './shared/host';
import type { Mount, RoutedHost } from './shared/sections';

/** Renders the section into the container the host owns, inside the shadow root it created. */
// ? A const carrying the contract's `Mount` rather than a function declaration: the annotation is
// ? what makes "this module needs a routed host" a compile-time check.
export const mount: Mount<RoutedHost> = ({ container, host }) => {
  // ! Not awaited. `mount` owes the shell its disposer synchronously, so the section paints while its
  // ! own configuration is still in flight and `$bootstrap` is what moves it on.
  void bootstrap(host);

  // Everything derived from the host lives on the frame — one per mount, never at module level.
  const frame = createHostFrame(host);

  render(h(App, { frame }), container);

  return () => {
    // The components go first: their cleanups may still speak to the frame.
    render(null, container);
    frame.dispose();
  };
};
