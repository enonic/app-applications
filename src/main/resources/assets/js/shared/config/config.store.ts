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

/**
 * Whether this instance maps virtual hosts, which is what decides an internal path is not reachable
 * from the page the section is mounted to — the admin page arrived through a mapping, and nothing
 * says the same mapping carries anything else. ? The question the section has is about the current
 * page, but the host boundary rules out reading it: no `window.location` here, so the installation's
 * own setting stands in. It answers the case exactly, since XP maps nothing unless it is on.
 * ! Read at render, like `isManagedMode`.
 */
export function hasVirtualHosts(): boolean {
  return $config.get()?.vhostsEnabled === true;
}
