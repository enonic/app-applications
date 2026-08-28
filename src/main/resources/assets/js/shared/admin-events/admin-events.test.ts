import { describe, expect, it, vi } from 'vitest';

import { createAdminEvents, type TopicHandlers } from './admin-events';

type ConnectHandlers = {
  onEvent: (event: { topic: string; data: unknown }) => void;
  onLoss: (loss: { topic: string; count: number | null }) => void;
};

function harness() {
  const subscribed: string[] = [];
  let handlers: ConnectHandlers | undefined;
  let resolveImport: (() => void) | undefined;

  const client = {
    connect: (h: ConnectHandlers) => {
      handlers = h;
      return { subscribe: (topic: string) => subscribed.push(topic) };
    },
  };

  const events = createAdminEvents(
    (url) =>
      new Promise((resolve) => {
        resolveImport = () => resolve(client);
        void url;
      }),
  );

  return {
    events,
    subscribed,
    emit: (topic: string, data: unknown) => handlers?.onEvent({ topic, data }),
    lose: (topic: string, count: number | null) => handlers?.onLoss({ topic, count }),
    arrive: async () => {
      resolveImport?.();
      await Promise.resolve();
      await Promise.resolve();
    },
  };
}

describe('createAdminEvents', () => {
  it('delivers a message only to the handlers of its topic', async () => {
    const { events, emit, arrive } = harness();
    const mine = vi.fn();
    const other = vi.fn();
    events.subscribeTopic('app:mine', { onMessage: mine });
    events.subscribeTopic('app:other', { onMessage: other });
    events.connect('/hub');
    await arrive();

    emit('app:mine', { n: 1 });

    expect(mine).toHaveBeenCalledWith({ n: 1 });
    expect(other).not.toHaveBeenCalled();
  });

  it('subscribes topics taken before the client arrived', async () => {
    const { events, subscribed, arrive } = harness();
    events.subscribeTopic('app:early', { onMessage: () => {} });
    events.connect('/hub');
    await arrive();

    expect(subscribed).toEqual(['app:early']);
  });

  it('subscribes a topic taken after the client arrived', async () => {
    const { events, subscribed, arrive } = harness();
    events.connect('/hub');
    await arrive();

    events.subscribeTopic('app:late', { onMessage: () => {} });

    expect(subscribed).toEqual(['app:late']);
  });

  it('reports loss to the topic that suffered it', async () => {
    const { events, lose, arrive } = harness();
    const onLoss = vi.fn();
    events.subscribeTopic('app:mine', { onMessage: () => {}, onLoss });
    events.connect('/hub');
    await arrive();

    lose('app:mine', 3);
    lose('app:mine', null);

    expect(onLoss).toHaveBeenNthCalledWith(1, 3);
    expect(onLoss).toHaveBeenNthCalledWith(2, null);
  });

  it('stops delivering once unsubscribed', async () => {
    const { events, emit, arrive } = harness();
    const onMessage = vi.fn();
    const unsubscribe = events.subscribeTopic('app:mine', { onMessage });
    events.connect('/hub');
    await arrive();

    unsubscribe();
    emit('app:mine', {});

    expect(onMessage).not.toHaveBeenCalled();
  });

  it('connects once, whatever asks again', async () => {
    let imports = 0;
    const events = createAdminEvents(() => {
      imports += 1;
      return Promise.resolve({ connect: () => ({ subscribe: () => {} }) });
    });

    events.connect('/hub');
    events.connect('/hub');
    await Promise.resolve();

    expect(imports).toBe(1);
  });

  it('logs and stays quiet when the client cannot be loaded', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const events = createAdminEvents(() => Promise.reject(new Error('offline')));
    const onMessage = vi.fn();
    events.subscribeTopic('app:mine', { onMessage } satisfies TopicHandlers);

    events.connect('/hub');
    await Promise.resolve();
    await Promise.resolve();

    expect(error).toHaveBeenCalled();
    expect(onMessage).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('retries the load on the next connect after a failure', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const subscribed: string[] = [];
    let attempts = 0;
    const events = createAdminEvents(() => {
      attempts += 1;
      return attempts === 1
        ? Promise.reject(new Error('offline'))
        : Promise.resolve({ connect: () => ({ subscribe: (t: string) => subscribed.push(t) }) });
    });
    events.subscribeTopic('app:mine', { onMessage: () => {} });

    events.connect('/hub');
    await Promise.resolve();
    await Promise.resolve();
    events.connect('/hub');
    await Promise.resolve();
    await Promise.resolve();

    expect(attempts).toBe(2);
    expect(subscribed).toEqual(['app:mine']);
    error.mockRestore();
  });
});
