import { beforeEach, describe, expect, it, vi } from 'vitest';

import { type TopicHandlers } from '../../../shared/admin-events';
import { HUB_TOPICS } from '../../../shared/sections/contract';
import { start, stop } from './install.service';
import { $marketInstalls, beginInstall } from './install.store';

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

const BOOSTER = 'com.enonic.app.booster';
const BOOSTER_JAR = 'https://repo.enonic.com/booster-3.0.1.jar';

function emit(data: unknown): void {
  subscribed.handlers.forEach((handlers) => (handlers as TopicHandlers).onMessage(data));
}

beforeEach(() => {
  stop();
  subscribed.handlers = [];
  subscribed.topics = [];
  $marketInstalls.set({});
});

describe('start', () => {
  it('subscribes the progress topic, and only once', () => {
    start();
    start();

    expect(subscribed.topics).toEqual([HUB_TOPICS.applicationProgress]);
  });

  it('fills the row installing that url', () => {
    beginInstall(BOOSTER, BOOSTER_JAR);
    start();

    emit({ url: BOOSTER_JAR, percent: 42 });

    expect($marketInstalls.get()[BOOSTER]).toEqual({ url: BOOSTER_JAR, percent: 42 });
  });

  it('leaves the row alone on a message it cannot read', () => {
    beginInstall(BOOSTER, BOOSTER_JAR);
    start();

    emit({ url: BOOSTER_JAR, percent: '42' });
    emit({ percent: 42 });
    emit(undefined);

    expect($marketInstalls.get()[BOOSTER]).toEqual({ url: BOOSTER_JAR });
  });

  // The topic carries every download on the node, not only the ones this browser started.
  it('drops progress for a url no row is installing', () => {
    beginInstall(BOOSTER, BOOSTER_JAR);
    start();

    emit({ url: 'https://repo.enonic.com/fathom-1.0.0.jar', percent: 99 });

    expect($marketInstalls.get()[BOOSTER]).toEqual({ url: BOOSTER_JAR });
  });
});

describe('stop', () => {
  it('stops delivering, and lets a later start subscribe again', () => {
    beginInstall(BOOSTER, BOOSTER_JAR);
    start();
    stop();

    emit({ url: BOOSTER_JAR, percent: 42 });
    expect($marketInstalls.get()[BOOSTER]).toEqual({ url: BOOSTER_JAR });

    start();
    emit({ url: BOOSTER_JAR, percent: 42 });
    expect($marketInstalls.get()[BOOSTER]).toEqual({ url: BOOSTER_JAR, percent: 42 });
  });
});
