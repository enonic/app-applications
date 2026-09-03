/**
 * The client-side contract between a shell and a module it mounts. The rules these names cannot
 * express are in `docs/extensions/docs.md` § 2.
 *
 * ! Duplicated verbatim in every provider until `@enonic/ui-types` publishes it — change every copy,
 * ! or a provider compiles against a contract the host does not implement.
 */

/**
 * Anything mutable the host hands over. `get()` is the current value; `subscribe` reports changes
 * only and never calls back on subscribe — read `get()` first. A nanostores atom satisfies the shape
 * through `listen`, not `subscribe`.
 */
export type Readable<T> = { get(): T; subscribe(cb: (v: T) => void): () => void };

export type Notification = {
  level: 'info' | 'success' | 'warning' | 'error';
  /** Already localized by the guest: no i18n key crosses the boundary. */
  message: string;
  /** `false` keeps it up until dismissed; a number overrides the host's own lifetime. */
  autoClose?: number | false;
};

/** What every host hands every mount, whatever the mount is: a section, a panel widget, a menu item. */
export type Host = {
  /**
   * The mounted module's own extension prefix — its data plane lives under it. Its last segment is
   * the extension key `<app>:<name>`, which is how a module serving several mounts tells them apart.
   */
  baseUrl: string;
  /** Resolved page locale; a locale change reloads the page, so it never changes mid-mount. */
  locale: string;
  /** Resolved theme; the guest applies it inside its shadow root. */
  theme: Readable<'light' | 'dark'>;
  /**
   * Whether this mount is on screen. The host keeps a mount alive while another shows, and a hidden
   * mount may pause what only a viewer needs — measuring, polling — until this turns true.
   */
  visible: Readable<boolean>;
  /** Toast on the host's stack; returns dismiss. */
  notify(n: Notification): () => void;
};

/** What a host adds for a mount that owns a segment of its url. */
export type Routed = {
  /** SubPath incl. search params; back/forward arrive here. */
  path: Readable<string>;
  /** Programmatic navigation within the module's own segment. */
  navigate(subPath: string, opts?: { replace?: boolean }): void;
};

/** What the `settings.section` interface hands a section. */
export type SectionHost = Host & Routed;

export type MountOptions<H extends Host = Host> = {
  /** Inside an open shadow root the host created. */
  container: HTMLElement;
  /** Valid until unmount, then revoked: a stale reference's calls become no-ops. */
  host: H;
};

/** Idempotent, and must not throw. The host wraps it anyway. */
export type Unmount = () => void;

/**
 * ! One module instance may serve several mounts: the host imports the same URL for every extension
 * ! an application ships (unless one opts out with `config.module`), so `mount` runs once per
 * ! extension from one instance and module-level state is shared across those mounts. Anything
 * ! derived from `host` belongs to the mount it was handed to.
 */
export type SectionModule<H extends Host = Host> = { mount(opts: MountOptions<H>): Unmount };
