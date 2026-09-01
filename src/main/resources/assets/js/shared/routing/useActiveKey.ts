import { useStore } from '@nanostores/preact';

import { $path } from './path.store';
import { itemKeyFromPath } from './routing';

/** The row the shell's url names, which is the browse list's active row. */
export function useActiveKey(): string | undefined {
  return itemKeyFromPath(useStore($path));
}
