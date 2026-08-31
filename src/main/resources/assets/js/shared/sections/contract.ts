/**
 * The client-side contract between this shell and a section another application provides. The rules
 * these names cannot express are in `docs/extensions/docs.md` § 2.
 *
 * ! Duplicated verbatim in every provider until `@enonic/toolkit/section` publishes it — change
 * ! every copy, or a provider compiles against a contract the host does not implement.
 */

/**
 * ? Anything mutable the host hands over. A nanostores atom satisfies it structurally, which is why
 * ? the contract names none — and why `subscribe` may call back straight away with the current value.
 */
export type Readable<T> = { get(): T; subscribe(cb: (v: T) => void): () => void };

/**
 * Canonical admin events hub topics the host registers and publishes; a section subscribes with
 * the platform-served client (`<eventsUrl>/client.js` → `connect().subscribe(topic)`). Each
 * topic's `allow` is server-side; payloads carry ids only.
 */
export const HUB_TOPICS = {
  /** Application lifecycle, `{eventType, key, systemApplication}`; `PROGRESS` excluded. */
  applications: 'com.enonic.xp.app.settings:applications',
  /** Principal changes, `{operation, changes: [{kind, key}]}`. */
  principals: 'com.enonic.xp.app.settings:principals',
} as const;

export type Notification = {
  level: 'info' | 'success' | 'warning' | 'error';
  /** Already localized by the guest: no i18n key crosses the boundary. */
  message: string;
  autoClose?: number | false;
  action?: { label: string; onAction(): void };
};

export type Host = {
  /** The mounted module's own extension prefix — its data plane lives under it. */
  baseUrl: string;
  /** Resolved page locale; a locale change reloads the page, so it never changes mid-mount. */
  locale: string;
  /** Resolved theme; the guest applies it inside its shadow root. */
  theme: Readable<'light' | 'dark'>;
  /** SubPath incl. search params; back/forward arrive here. */
  path: Readable<string>;
  /** Programmatic navigation within the module's own segment. */
  navigate(subPath: string, opts?: { replace?: boolean }): void;
  /** Href builder for real anchors within the module's own segment. */
  url(subPath: string): string;
  /** Toast on the host's stack; returns dismiss. */
  notify(n: Notification): () => void;
};

export type MountOptions = {
  /** Inside an open shadow root the host created. */
  container: HTMLElement;
  /** Valid until unmount, then revoked: a stale reference's calls become no-ops. */
  host: Host;
};

/** Idempotent, and must not throw. The host wraps it anyway. */
export type Unmount = () => void;

export type SectionModule = { mount(opts: MountOptions): Unmount };
