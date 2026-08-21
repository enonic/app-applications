import { h, render } from 'preact';

import type { MountOptions, Unmount } from './section-contract';
import { HelloWorld } from './section/HelloWorld';

/** Renders the section into the container the host owns, inside the shadow root it created. */
export function mount({ container, host }: MountOptions): Unmount {
  render(h(HelloWorld, { baseUrl: host.baseUrl, locale: host.locale }), container);

  return () => render(null, container);
}
