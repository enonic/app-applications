import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const connectAdminEvents = vi.hoisted(() => vi.fn());
const subscribeTopic = vi.hoisted(() => vi.fn());
vi.mock('../shared/admin-events', () => ({
  connectAdminEvents,
  subscribeTopic,
  APPLICATIONS_TOPIC: 'com.enonic.xp.app.settings:applications',
}));

import { startSectionEvents, stopSectionEvents } from './events';

const EVENTS_URL = '/_/admin:events';

describe('startSectionEvents', () => {
  beforeEach(() => {
    subscribeTopic.mockReturnValue(() => {});
  });

  afterEach(() => {
    stopSectionEvents();
    vi.clearAllMocks();
  });

  it('connects to the hub and subscribes the applications topic once', () => {
    startSectionEvents(EVENTS_URL);
    startSectionEvents(EVENTS_URL);

    expect(connectAdminEvents).toHaveBeenCalledExactlyOnceWith(EVENTS_URL);
    expect(subscribeTopic).toHaveBeenCalledExactlyOnceWith(
      'com.enonic.xp.app.settings:applications',
      expect.anything(),
    );
  });

  it('drops the subscription on stop and can start again', () => {
    const unsubscribe = vi.fn();
    subscribeTopic.mockReturnValue(unsubscribe);

    startSectionEvents(EVENTS_URL);
    stopSectionEvents();

    expect(unsubscribe).toHaveBeenCalled();

    startSectionEvents(EVENTS_URL);
    expect(subscribeTopic).toHaveBeenCalledTimes(2);
  });
});
