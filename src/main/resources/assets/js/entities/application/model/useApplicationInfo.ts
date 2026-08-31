import { useStore } from '@nanostores/preact';
import { useEffect } from 'preact/hooks';

import {
  $applicationsInfo,
  type ApplicationInfoEntry,
  ensureApplicationInfo,
} from './application-info.store';
import type { ApplicationState } from './application.types';

/**
 * What the application under `key` provides, loaded on first sight and cached after. The store keeps an
 * entry per key and knows nothing about which is on screen, so asking again for a missing entry is what
 * reloads a panel invalidated by a lifecycle event under it.
 */
export function useApplicationInfo(
  key: string | undefined,
  state?: ApplicationState,
): ApplicationInfoEntry | undefined {
  const entries = useStore($applicationsInfo);
  const stopped = state === 'STOPPED';
  const entry = key == null || stopped ? undefined : entries[key];
  const missing = key != null && entry === undefined;

  useEffect(() => {
    if (key != null && !stopped) {
      ensureApplicationInfo(key);
    }
  }, [key, stopped, missing]);

  return entry;
}
