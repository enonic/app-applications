import {
  HUB_TOPICS,
  subscribeTopic,
  toApplicationProgressMessage,
} from '../../../shared/admin-events';
import { receiveInstallProgress } from './install.store';

let unsubscribe: (() => void) | undefined;

/**
 * Follows the downloads core is working through, so a row installing from the market fills as its jar
 * arrives. The topic carries every download on the node, this app's and another admin's alike; the
 * store keeps only the ones a row here is waiting for.
 */
export function start(): void {
  if (unsubscribe != null) {
    return;
  }

  unsubscribe = subscribeTopic(HUB_TOPICS.applicationProgress, {
    onMessage: handleMessage,
    // ? No onLoss. A missed percent is corrected by the next one, and the end of an install is the
    // ? lifecycle topic's business — there is nothing here to refetch.
  });
}

export function stop(): void {
  unsubscribe?.();
  unsubscribe = undefined;
}

// *
// * Internal
// *

function handleMessage(data: unknown): void {
  const message = toApplicationProgressMessage(data);
  if (message == null) {
    return;
  }

  receiveInstallProgress(message.url, message.percent);
}
