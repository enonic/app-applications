import { atom, type ReadableAtom } from 'nanostores';

import type { Host, Notification, SectionHost } from '../sections';

type Level = Notification['level'];

/** What a command is handed to say how it went: the `notify` of the mount that ran it. */
export type Notify = (level: Level, message: string) => void;

/**
 * The host object and everything this section derives from it, for one mount. `mount` can run more
 * than once per module instance — the host may serve every section of an app from one URL — so none
 * of this may live at module level: each mount builds its own frame, hands it down through
 * `HostFrameProvider`, and disposes it with the unmount.
 */
export type HostFrame = {
  host: SectionHost;
  /**
   * The selected row, as the section's own sub-path carries it: `/` is the list with nothing open,
   * `/<key>` is that item.
   *
   * ? A section has exactly one nested route — the details of one item — so the host's `path` is the
   * ? whole of its routing; `host.navigate` is the only history there is.
   */
  $itemId: ReadableAtom<string | undefined>;
  /** `host.visible` as a store: the shell keeps a section mounted while the operator is on another. */
  $visible: ReadableAtom<boolean>;
  openItem: (key: string) => void;
  closeItem: () => void;
  /**
   * A toast on the shell's stack, already localized: a component names the level where it knows the
   * outcome, and a command takes this as its `Notify` argument rather than reaching for the host.
   */
  notify: Notify;
  /** Stops following the host. Runs with the unmount, after the components are gone. */
  dispose: () => void;
};

export function createHostFrame(host: SectionHost): HostFrame {
  // ! Read before subscribing: a `Readable` never calls back on subscribe, so a deep link would
  // ! otherwise leave its row unopened until the first navigation.
  const $itemId = atom<string | undefined>(itemIdOf(host.path.get()));
  const unfollowPath = host.path.subscribe((path) => $itemId.set(itemIdOf(path)));
  const $visible = atom(host.visible.get());
  const unfollowVisible = host.visible.subscribe((visible) => $visible.set(visible));

  return {
    host,
    $itemId,
    $visible,
    // ! Both replace rather than push: the active row moves with the arrow keys too, and every step a
    // ! user holds a key through would otherwise land in the shell's history.
    openItem: (key) => host.navigate(`/${encodeURIComponent(key)}`, { replace: true }),
    closeItem: () => host.navigate('/', { replace: true }),
    notify: (level, message) => raise(host, level, message),
    dispose: () => {
      unfollowPath();
      unfollowVisible();
    },
  };
}

//
// * Internal
//

/**
 * The shell owns the toast stack — a section paints inside its own shadow root and has nowhere to
 * put one — so this hands the message over and keeps nothing. How long it stays and where it
 * appears are the host's to decide, which is why no lifetime crosses.
 *
 * ! Already localized: no i18n key crosses the boundary, per the contract.
 */
function raise(host: Host, level: Level, message: string): void {
  host.notify({ level, message });
}

function itemIdOf(path: string): string | undefined {
  const [segment] = path.replace(/^\/+/, '').split(/[/?#]/);
  if (segment === undefined || segment === '') {
    return undefined;
  }

  // ! A typed url may carry an escape that does not decode; that is a key naming no row, not a
  // ! reason to throw out of `mount` or out of the shell's path listener.
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}
