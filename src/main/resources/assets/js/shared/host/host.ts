import type { Host } from '../sections';

/**
 * The running mount's host, for code no component can hand it to: a store, a command, a load function.
 * ! Module state, so one per module rather than one per mount — and `mount` runs once per *section*. This
 * app ships one, so they coincide; a second pointed here would need per-mount state through context.
 */
let current: Host | undefined;

/** Publishes the host for this mount, and hands back the release its unmount owes it. */
export function setHost(host: Host): () => void {
  current = host;

  // ! Only what it published. The shell mounts before it disposes, so a section replacing another
  // ! would otherwise have its host cleared by the outgoing mount's release.
  return () => {
    if (current === host) {
      current = undefined;
    }
  };
}

/**
 * The host, while a mount is running. ! `undefined` is a real answer, not a state to assert against: a
 * store's callback outlives the mount that armed it, and a revoked host's calls are already no-ops. A
 * caller does nothing when there is none rather than throwing into a timer or subscription.
 */
export function getHost(): Host | undefined {
  return current;
}
