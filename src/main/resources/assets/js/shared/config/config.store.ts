import { atom } from 'nanostores';

import type { Config } from './config';

// Fetched after mount rather than read from the page, so the store starts empty instead of carrying a
// fake default. `app/App.tsx` renders nothing until the bootstrap has filled it.
export const $config = atom<Config | undefined>(undefined);

export function setConfig(config: Config): void {
  $config.set(config);
}

/**
 * Whether what is installed is decided elsewhere — an operator, a pipeline — in which case the section
 * offers nothing that changes it. ! Read at render, not subscribed to: `App` renders nothing until the
 * bootstrap filled the store, and the value cannot change without a redeploy.
 */
export function isManagedMode(): boolean {
  return $config.get()?.managedMode === true;
}
