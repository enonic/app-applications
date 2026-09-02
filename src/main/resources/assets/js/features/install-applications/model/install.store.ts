import { map } from 'nanostores';

export type MarketInstall = {
  /** The download core is working through, and what its progress events are keyed by. */
  url: string;
  /**
   * How much of the download is done, 0–100. Undefined until the first event, and stuck at 0 where the
   * download carries no content length for core to measure against.
   */
  percent?: number;
};

/**
 * The installs in flight, by market key. ? A store rather than dialog state: an install outlives the
 * dialog it started from, and the row has to still be installing when the operator comes back.
 */
export const $marketInstalls = map<Record<string, MarketInstall>>({});

export function beginInstall(key: string, url: string): void {
  $marketInstalls.setKey(key, { url });
}

/**
 * Records progress against whichever row is installing that url. Core reports the url and nothing else,
 * so an event for a download this app did not start is dropped.
 *
 * ! Matched by exact string equality. Core echoes the url it was handed — `URI.create(url).toURL()
 * ! .toString()` — which round-trips a market download url unchanged; normalizing either end with
 * ! the browser's own `URL` would not agree with Java's and could break a match that holds.
 */
export function receiveInstallProgress(url: string, percent: number): void {
  const installs = $marketInstalls.get();
  const key = Object.keys(installs).find((candidate) => installs[candidate]?.url === url);
  if (key == null) {
    return;
  }

  $marketInstalls.setKey(key, { url, percent });
}

export function endInstall(key: string): void {
  const { [key]: _ended, ...rest } = $marketInstalls.get();
  $marketInstalls.set(rest);
}

export function isInstalling(key: string): boolean {
  return $marketInstalls.get()[key] != null;
}
