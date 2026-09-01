import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type TopicHandlers } from '../../../shared/admin-events';
import { HUB_TOPICS } from '../../../shared/sections/contract';
import { loadMarketApplications } from './market.load';
import { affectsMarket, start, stop } from './market.service';
import { $marketApplications } from './market.store';

const subscribed = vi.hoisted(() => ({ handlers: [] as unknown[], topics: [] as string[] }));

vi.mock('../../../shared/admin-events', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../../shared/admin-events')>()),
  subscribeTopic: vi.fn((topic: string, handlers: unknown) => {
    subscribed.topics.push(topic);
    subscribed.handlers.push(handlers);
    return () => {
      subscribed.handlers = subscribed.handlers.filter((entry) => entry !== handlers);
    };
  }),
}));

vi.mock('./market.load', () => ({ loadMarketApplications: vi.fn() }));

function message(eventType: string, key = 'com.enonic.app.booster'): unknown {
  return { eventType, key };
}

function emit(data: unknown): void {
  subscribed.handlers.forEach((handlers) => (handlers as TopicHandlers).onMessage(data));
}

function emitLoss(count: number | null): void {
  subscribed.handlers.forEach((handlers) => (handlers as TopicHandlers).onLoss?.(count));
}

function cacheCatalogue(): void {
  $marketApplications.set({ status: 'ready', items: [] });
}

beforeEach(() => {
  stop();
  subscribed.handlers = [];
  subscribed.topics = [];
  $marketApplications.set({ status: 'loading', items: [] });
  vi.mocked(loadMarketApplications).mockReset();
  vi.mocked(loadMarketApplications).mockResolvedValue(undefined);
});

describe('affectsMarket', () => {
  it('accepts the events that move an installed version', () => {
    expect(affectsMarket(message('INSTALLED'))).toBe(true);
    expect(affectsMarket(message('UNINSTALLED'))).toBe(true);
    expect(affectsMarket(message('UPDATED'))).toBe(true);
  });

  it('ignores run state, which the catalogue does not carry', () => {
    expect(affectsMarket(message('STARTED'))).toBe(false);
    expect(affectsMarket(message('STOPPED'))).toBe(false);
  });

  it('ignores a payload it cannot read', () => {
    expect(affectsMarket(undefined)).toBe(false);
    expect(affectsMarket('INSTALLED')).toBe(false);
    expect(affectsMarket({})).toBe(false);
  });
});

describe('start', () => {
  it('reloads the catalogue when an application is uninstalled', () => {
    cacheCatalogue();
    start();

    emit(message('UNINSTALLED'));

    expect(loadMarketApplications).toHaveBeenCalledTimes(1);
  });

  it('reloads it when an installed version changes under it', () => {
    cacheCatalogue();
    start();

    emit(message('UPDATED'));

    expect(loadMarketApplications).toHaveBeenCalledTimes(1);
  });

  // Core publishes INSTALLED whatever installed the application — the market tab, an uploaded jar,
  // another operator, a jar in the deploy folder — and this is the only thing that answers for it.
  it('reloads it on an install, whatever started it', () => {
    cacheCatalogue();
    start();

    emit(message('INSTALLED'));

    expect(loadMarketApplications).toHaveBeenCalledTimes(1);
  });

  // A gap may have hidden an install, and the hub replays nothing.
  it('reloads it on a loss', () => {
    cacheCatalogue();
    start();

    emitLoss(2);

    expect(loadMarketApplications).toHaveBeenCalledTimes(1);
  });

  // The one read that leaves the instance: an event nobody is looking at must not cost a call to
  // Enonic Market.
  it('asks for nothing while no catalogue has been loaded, on a message or a loss', () => {
    start();

    emit(message('UNINSTALLED'));
    emitLoss(null);

    expect(loadMarketApplications).not.toHaveBeenCalled();
  });

  it('subscribes the hub-owned applications topic once however often it is started', () => {
    cacheCatalogue();
    start();
    start();

    emit(message('UNINSTALLED'));

    expect(loadMarketApplications).toHaveBeenCalledTimes(1);
    expect(subscribed.topics).toEqual([HUB_TOPICS.applications]);
  });
});

describe('stop', () => {
  it('stops reloading once it has been stopped', () => {
    cacheCatalogue();
    start();
    stop();

    emit(message('UNINSTALLED'));

    expect(loadMarketApplications).not.toHaveBeenCalled();
  });
});
