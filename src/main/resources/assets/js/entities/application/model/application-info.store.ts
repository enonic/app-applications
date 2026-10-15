import { map } from 'nanostores';

import { fetchApplicationInfo } from '../api/application-info.api';
import type { ApplicationInfo } from './application.types';

export type ApplicationInfoEntry = {
  status: 'loading' | 'ready' | 'error';
  info?: ApplicationInfo;
  error?: string;
};

/** One entry per application ever opened, kept for the session. */
export const $applicationsInfo = map<Record<string, ApplicationInfoEntry | undefined>>({});

// One load per key at a time. An answer lands under the key it was asked for, so a load is never
// cancelled by the details column moving on — only by its entry being cleared.
const pending = new Map<string, AbortController>();

export function ensureApplicationInfo(key: string): void {
  const entry = $applicationsInfo.get()[key];

  // An entry that failed is treated as a miss, so coming back to the application retries.
  if ((entry != null && entry.status !== 'error') || pending.has(key)) {
    return;
  }

  load(key);
}

/**
 * Forgets what an application provides — its descriptors change when it is started, stopped, updated or
 * uninstalled. An open panel reloads at once, because `useApplicationInfo` asks again for the missing
 * entry; anything else loads on its next visit.
 */
export function invalidateApplicationInfo(key: string): void {
  pending.get(key)?.abort();
  pending.delete(key);

  if ($applicationsInfo.get()[key] == null) {
    return;
  }
  $applicationsInfo.setKey(key, undefined);
}

// *
// * Internal
// *

function load(key: string): void {
  const controller = new AbortController();
  pending.set(key, controller);
  const { signal } = controller;

  $applicationsInfo.setKey(key, { status: 'loading' });

  void fetchApplicationInfo(key, signal)
    .match(
      (info) => {
        if (!signal.aborted) {
          $applicationsInfo.setKey(key, { status: 'ready', info });
        }
      },
      (error) => {
        if (!signal.aborted) {
          $applicationsInfo.setKey(key, { status: 'error', error: error.message });
        }
      },
    )
    .finally(() => {
      if (pending.get(key) === controller) {
        pending.delete(key);
      }
    });
}
