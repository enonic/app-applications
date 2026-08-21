import { h, render } from 'preact';

import { App } from './app/App';
import type { MountOptions, Unmount } from './shared/sections';
import { adoptStyleSheet } from './shared/styles';

/** Renders the section into the container the host owns, inside the shadow root it created. */
export function mount({ container, host }: MountOptions): Unmount {
  adoptStyleSheet(container);
  render(h(App, { host }), container);

  return () => render(null, container);
}
