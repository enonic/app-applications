import type { TopicHandlers } from '@enonic/ui-utils/admin-events';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const hub = vi.hoisted(() => {
  const registry = new Map<string, Set<{ handlers: TopicHandlers }>>();
  const urls: string[] = [];

  return {
    registry,
    urls,
    deliver: (topic: string, data: unknown) =>
      registry.get(topic)?.forEach(({ handlers }) => handlers.onMessage(data)),
    reset: () => {
      registry.clear();
      urls.length = 0;
    },
  };
});

vi.mock('@enonic/ui-utils/admin-events', () => ({
  createAdminEvents: (url: string) => {
    hub.urls.push(url);
    return {
      connect: () => {},
      subscribeTopic: (topic: string, handlers: TopicHandlers) => {
        const registration = { handlers };
        const set = hub.registry.get(topic) ?? new Set();
        set.add(registration);
        hub.registry.set(topic, set);
        return () => set.delete(registration);
      },
    };
  },
}));

const TOPIC = 'applications';
const URL = '/_/admin:events';

async function load() {
  vi.resetModules();
  return import('./admin-events');
}

function received(): { messages: unknown[]; handlers: TopicHandlers } {
  const messages: unknown[] = [];
  return { messages, handlers: { onMessage: (data) => messages.push(data) } };
}

describe('admin events', () => {
  beforeEach(() => hub.reset());

  it('delivers to a subscription taken before the hub was connected', async () => {
    const { connectAdminEvents, subscribeTopic } = await load();
    const { messages, handlers } = received();

    subscribeTopic(TOPIC, handlers);
    connectAdminEvents(URL);
    hub.deliver(TOPIC, 'installed');

    expect(messages).toEqual(['installed']);
  });

  it('drops an early subscription unsubscribed before the hub was connected', async () => {
    const { connectAdminEvents, subscribeTopic } = await load();
    const { messages, handlers } = received();

    subscribeTopic(TOPIC, handlers)();
    connectAdminEvents(URL);
    hub.deliver(TOPIC, 'installed');

    expect(messages).toEqual([]);
  });

  it('detaches an early subscription unsubscribed after the hub was connected', async () => {
    const { connectAdminEvents, subscribeTopic } = await load();
    const { messages, handlers } = received();

    const unsubscribe = subscribeTopic(TOPIC, handlers);
    connectAdminEvents(URL);
    unsubscribe();
    hub.deliver(TOPIC, 'installed');

    expect(messages).toEqual([]);
  });

  it('creates one hub however many times it is connected', async () => {
    const { connectAdminEvents } = await load();

    connectAdminEvents(URL);
    connectAdminEvents(URL);

    expect(hub.urls).toEqual([URL]);
  });
});
