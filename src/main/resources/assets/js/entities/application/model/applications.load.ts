import { err, ok } from 'neverthrow';

import { fetchApplication, fetchApplications } from '../api/applications.api';
import {
  beginApplicationsLoad,
  isApplicationsCached,
  receiveApplication,
  receiveApplications,
  removeApplication,
} from './applications.store';

/**
 * Loads the Applications list; one domain, so the load belongs to the slice. ! Refresh, a server event and
 * a reconnect all retrigger it, so the previous load is cancelled and its answer dropped — without that
 * the slower of two requests decides what the list shows.
 */
let pending: AbortController | undefined;

// A remount that lands mid-load joins the request in flight rather than starting a second one.
let inFlight: Promise<void> | undefined;

// One refetch per key at a time, independent of the full reload above: a full reload that lands
// after a per-key answer simply overwrites it with the same server state.
const perKey = new Map<string, AbortController>();

export function loadApplications(): Promise<void> {
  pending?.abort();
  const controller = new AbortController();
  pending = controller;
  const { signal } = controller;

  beginApplicationsLoad();

  inFlight = fetchApplications(signal)
    .match(
      (items) => {
        if (!signal.aborted) {
          receiveApplications(ok(items));
        }
      },
      (error) => {
        if (!signal.aborted) {
          receiveApplications(err(error));
        }
      },
    )
    .finally(() => {
      // A load a newer one replaced must not clear the newer one's promise.
      if (pending === controller) {
        inFlight = undefined;
      }
    });

  return inFlight;
}

/**
 * The first visit's load and nothing on a later one: the list is the whole set, so coming back reads what
 * is already there. Refresh and the service call `loadApplications`.
 */
export function ensureApplications(): Promise<void> {
  if (isApplicationsCached()) {
    return Promise.resolve();
  }

  return inFlight ?? loadApplications();
}

/**
 * Refetches one application after a command or a server event, leaving the rest of the list alone. A no-op
 * until the list is cached — a first load fetches fresh state anyway.
 */
export function loadApplication(key: string): Promise<void> {
  if (!isApplicationsCached()) {
    return Promise.resolve();
  }

  perKey.get(key)?.abort();
  const controller = new AbortController();
  perKey.set(key, controller);
  const { signal } = controller;

  return fetchApplication(key, signal)
    .match(
      (application) => {
        if (signal.aborted) {
          return;
        }
        if (application == null) {
          removeApplication(key);
        } else {
          receiveApplication(application);
        }
      },
      () => {
        // The list still shows valid, if stale, state — the next event or Refresh resyncs it.
        // Flipping the whole list to `error` over one background refetch would be worse.
      },
    )
    .finally(() => {
      if (perKey.get(key) === controller) {
        perKey.delete(key);
      }
    });
}
