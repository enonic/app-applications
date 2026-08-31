import { atom } from 'nanostores';

import type { Host } from '../sections';
import { LIST_PATH } from './routing';

/**
 * The section's sub-path as the shell's url has it. The host object is the only source — a deep link,
 * a `navigate` of our own and the browser's back button all arrive the same way.
 */
export const $path = atom<string>(LIST_PATH);

/** Follows the host's path for the life of the mount, and hands back the unmount's unsubscribe. */
export function startRouting({ path }: Host): () => void {
  // ! Read before subscribing: a mount opened on a deep link has its row in the url already, and
  // ! `subscribe` is only promised to emit on a change.
  $path.set(path.get());

  return path.subscribe((next) => $path.set(next));
}
