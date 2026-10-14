import type { ReadableAtom } from 'nanostores';

import {
  createTopicReaction,
  HUB_TOPICS,
  subscribeTopic,
  toApplicationsMessage,
  type TopicReaction,
} from '../../../shared/admin-events';
import { $applicationsInfo, invalidateApplicationInfo } from './application-info.store';
import { loadApplication, loadApplications } from './applications.load';
import { isApplicationsCached, removeApplication } from './applications.store';

export type ApplicationChange = {
  kind: 'installed' | 'uninstalled' | 'changed';
  key: string;
};

type ChangeKind = ApplicationChange['kind'];

// Past this many applications a window is a bulk change, and one re-read beats that many requests
// through a serial transport.
const BATCH_LIMIT = 10;

let running: TopicReaction | undefined;

/**
 * Reads an application lifecycle change out of a hub message, however it was caused — this section,
 * another admin, a jar dropped in the deploy folder. STARTING/STOPPING and the resolver states are
 * transient and each is followed by a terminal event, so only the terminal ones count.
 */
export function toApplicationChange(data: unknown): ApplicationChange | undefined {
  const message = toApplicationsMessage(data);
  const key = message?.key;
  if (message == null || key == null) {
    return undefined;
  }

  switch (message.eventType) {
    case 'INSTALLED':
      return { kind: 'installed', key };
    case 'UNINSTALLED':
      return { kind: 'uninstalled', key };
    case 'STARTED':
    case 'STOPPED':
    case 'UPDATED':
      return { kind: 'changed', key };
    default:
      return undefined;
  }
}

/**
 * Follows the `applications` topic while the section is shown: a burst is applied as one batch, and
 * what happens while it is hidden is dropped for one refresh on reveal.
 */
export function start($visible: ReadableAtom<boolean>): void {
  if (running !== undefined) {
    return;
  }

  running = createTopicReaction({
    events: { subscribeTopic },
    topic: HUB_TOPICS.applications,
    parse: toApplicationChange,
    visible: $visible,
    apply,
    refresh,
  });
  running.start();
}

export function stop(): void {
  running?.stop();
  running = undefined;
}

// *
// * Internal
// *

function apply(changes: readonly ApplicationChange[]): void {
  const settled = settle(changes);
  const changed: string[] = [];
  let reload = false;

  settled.forEach((kind, key) => {
    invalidateApplicationInfo(key);

    switch (kind) {
      case 'installed':
        reload = true;
        return;
      case 'uninstalled':
        removeApplication(key);
        return;
      case 'changed':
        changed.push(key);
        return;
    }
  });

  if (reload || changed.length > BATCH_LIMIT) {
    reloadCachedList();
    return;
  }

  changed.forEach((key) => void loadApplication(key));
}

/**
 * One kind per application, the batch read in order. ! An install stays an install through the changes
 * after it: the list has no row for it yet, and only a reload makes one.
 */
function settle(changes: readonly ApplicationChange[]): Map<string, ChangeKind> {
  const settled = new Map<string, ChangeKind>();

  changes.forEach(({ kind, key }) => {
    settled.set(key, kind === 'changed' && settled.get(key) === 'installed' ? 'installed' : kind);
  });

  return settled;
}

// ? What an application provides is forgotten with the list: a lost or dropped message may have moved
// ? any of it, and an open panel asks again for what it is missing.
function refresh(): void {
  Object.keys($applicationsInfo.get()).forEach((key) => invalidateApplicationInfo(key));
  reloadCachedList();
}

function reloadCachedList(): void {
  if (isApplicationsCached()) {
    void loadApplications();
  }
}
