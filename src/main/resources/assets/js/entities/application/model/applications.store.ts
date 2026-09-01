import { map } from 'nanostores';
import type { Result } from 'neverthrow';

import type { AppError } from '../../../shared/api';
import type { Application } from './application.types';

export type ApplicationsState = {
  status: 'loading' | 'ready' | 'error';
  items: readonly Application[];
  error?: string;
};

export const $applications = map<ApplicationsState>({ status: 'loading', items: [] });

/**
 * ! Only an empty list waits on a skeleton. A reload the user did not ask for — a reconnect, an
 * ! install event elsewhere — must not blank a list that is already on screen, and Refresh over a
 * ! loaded list reads as a flash for no gain.
 */
export function beginApplicationsLoad(): void {
  if ($applications.get().items.length === 0) {
    $applications.setKey('status', 'loading');
  }
}

export function receiveApplications(result: Result<Application[], AppError>): void {
  result.match(
    (items) => $applications.set({ status: 'ready', items }),
    (error) => $applications.set({ status: 'error', items: [], error: error.message }),
  );
}

/** Replaces one row, in display-name order, after a lifecycle command or a server event. */
export function receiveApplication(application: Application): void {
  const { items } = $applications.get();
  const next = [...items.filter(({ key }) => key !== application.key), application].sort(
    byDisplayName,
  );
  $applications.setKey('items', next);
}

/** Drops an uninstalled application from the cached list without asking the server. */
export function removeApplication(key: string): void {
  const { items } = $applications.get();
  const remaining = items.filter((application) => application.key !== key);
  if (remaining.length !== items.length) {
    $applications.setKey('items', remaining);
  }
}

export function isApplicationsCached(): boolean {
  return $applications.get().status === 'ready';
}

// *
// * Internal
// *

function byDisplayName(a: Application, b: Application): number {
  return a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' });
}
