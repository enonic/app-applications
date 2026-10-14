import { afterEach, describe, expect, it, vi } from 'vitest';

const { calls, record } = vi.hoisted(() => {
  const calls: string[] = [];
  const record = (name: string) => (): void => {
    calls.push(name);
  };
  return { calls, record };
});

vi.mock('../shared/admin-events', () => ({
  connectAdminEvents: (url: string) => calls.push(`connect ${url}`),
}));
vi.mock('../entities/application', () => ({
  startApplicationsService: record('start applications'),
  stopApplicationsService: record('stop applications'),
}));
vi.mock('../entities/market', () => ({
  startMarketService: record('start market'),
  stopMarketService: record('stop market'),
}));
vi.mock('../features/install-applications', () => ({
  startInstallService: record('start install'),
  stopInstallService: record('stop install'),
}));

import { $config, setConfig } from '../shared/config';
import { startSectionEvents, stopSectionEvents } from './events';

const EVENTS_URL = '/_/admin:events';

describe('startSectionEvents', () => {
  afterEach(() => {
    calls.length = 0;
    $config.set(undefined);
  });

  // ! The order is the point: a topic subscribed before the hub exists would be dropped.
  it('connects to the configured hub, then subscribes the services', () => {
    setConfig({
      appId: 'com.enonic.xp.app.applications',
      appVersion: '8.1.0',
      eventsUrl: EVENTS_URL,
      managedMode: false,
      serverAppUrl: '/_/server:app',
      vhostsEnabled: false,
    });

    startSectionEvents();

    expect(calls).toEqual([
      `connect ${EVENTS_URL}`,
      'start applications',
      'start market',
      'start install',
    ]);
  });

  it('leaves the hub shut before the section has its configuration', () => {
    startSectionEvents();

    expect(calls).toEqual([]);
  });
});

describe('stopSectionEvents', () => {
  it('stops every service', () => {
    stopSectionEvents();

    expect(calls).toEqual(['stop install', 'stop market', 'stop applications']);
  });
});
