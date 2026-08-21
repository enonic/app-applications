import { h, render } from 'preact';

import { HelloWorld } from './section/HelloWorld';

/** Renders the section into a container the host owns. The return value unmounts it. */
export function mount(container: HTMLElement): () => void {
  render(h(HelloWorld, {}), container);

  return () => render(null, container);
}
