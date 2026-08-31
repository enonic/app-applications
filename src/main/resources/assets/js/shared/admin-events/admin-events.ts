/**
 * The admin events hub, browser side. The platform's client (`<admin:events>/client.js`) rides a
 * shared worker keyed by the script url, so every consumer on the page shares one socket. The
 * topics are owned and published by the hub application (app-settings) — this side only
 * subscribes; per-topic authorization is the server's (`setTopic` `allow`), never re-decided here.
 */

export type TopicHandlers = {
  /** A message on the topic; refetching is the usual answer. The payload is the publisher's. */
  onMessage: (data: unknown) => void;
  /** Messages were missed: `count` when the gap is countable, `null` when it is not. */
  onLoss?: (count: number | null) => void;
};

// What `client.js` exports, as far as this module uses it.
type HubEvent = { topic: string; data: unknown };
type HubLoss = { topic: string; count: number | null };
type HubClient = {
  connect(handlers: {
    onEvent: (event: HubEvent) => void;
    onLoss: (loss: HubLoss) => void;
  }): HubConnection;
};
type HubConnection = { subscribe(topic: string): void };

export type AdminEvents = {
  /** Loads the served client and connects once; a failed load unlatches, so a later call retries. */
  connect(url: string): void;
  /**
   * Delivers the topic's messages until unsubscribed. The underlying hub subscription stays for
   * the page's life — this only detaches the handlers.
   */
  subscribeTopic(topic: string, handlers: TopicHandlers): () => void;
};

type ImportModule = (url: string) => Promise<unknown>;

/** Exported for tests; the app uses the singleton below. */
export function createAdminEvents(
  // ? @vite-ignore: the specifier is a runtime url served by the platform.
  importModule: ImportModule = (url) => import(/* @vite-ignore */ url),
): AdminEvents {
  const registry = new Map<string, Set<TopicHandlers>>();
  let connection: HubConnection | undefined;
  let connecting = false;

  const dispatch = (topic: string, deliver: (handlers: TopicHandlers) => void): void => {
    registry.get(topic)?.forEach(deliver);
  };

  return {
    connect: (url) => {
      if (connecting) {
        return;
      }
      connecting = true;

      importModule(`${url}/client.js`)
        .then((loaded) => {
          connection = (loaded as HubClient).connect({
            onEvent: ({ topic, data }) => dispatch(topic, (h) => h.onMessage(data)),
            onLoss: ({ topic, count }) => dispatch(topic, (h) => h.onLoss?.(count)),
          });

          // Subscriptions taken before the client arrived.
          registry.forEach((_, topic) => connection?.subscribe(topic));
        })
        .catch((cause: unknown) => {
          // ! Unlatch, or one transient failure would kill live updates for the page's life: the
          // ! next connect() — a section re-entered, a later start — retries the import.
          connecting = false;
          console.error('Failed to load the admin events client:', cause);
        });
    },
    subscribeTopic: (topic, handlers) => {
      let set = registry.get(topic);
      if (set == null) {
        set = new Set();
        registry.set(topic, set);
      }
      set.add(handlers);

      // Idempotent on the hub client, so a second subscriber costs nothing.
      connection?.subscribe(topic);

      return () => {
        set.delete(handlers);
      };
    },
  };
}

const adminEvents = createAdminEvents();

export const connectAdminEvents: AdminEvents['connect'] = (url) => adminEvents.connect(url);

export const subscribeTopic: AdminEvents['subscribeTopic'] = (topic, handlers) =>
  adminEvents.subscribeTopic(topic, handlers);
