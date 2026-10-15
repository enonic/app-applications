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
  startApplicationsService: vi.fn(record('start applications')),
  stopApplicationsService: record('stop applications'),
}));
vi.mock('../entities/market', () => ({
  startMarketService: vi.fn(record('start market')),
  stopMarketService: record('stop market'),
}));
vi.mock('../features/install-applications', () => ({
  startInstallService: record('start install'),
  stopInstallService: record('stop install'),
}));

import { fakeHost } from '../../../../../test/mocks/fake-host';
import { startApplicationsService } from '../entities/application';
import { startMarketService } from '../entities/market';
import { $config, setConfig } from '../shared/config';
import { createHostFrame } from '../shared/host';
import { startSectionEvents, stopSectionEvents } from './events';

const EVENTS_URL = '/_/admin:events';

const CONFIG = {
  appId: 'com.enonic.xp.app.applications',
  appVersion: '8.1.0',
  eventsUrl: EVENTS_URL,
  managedMode: false,
  serverAppUrl: '/_/server:app',
  vhostsEnabled: false,
};

const frame = createHostFrame(fakeHost());

describe('startSectionEvents', () => {
  afterEach(() => {
    calls.length = 0;
    vi.clearAllMocks();
    $config.set(undefined);
  });

  // ! The order is the point: a topic subscribed before the hub exists would be dropped.
  it('connects to the configured hub, then subscribes the services', () => {
    setConfig(CONFIG);

    startSectionEvents(frame);

    expect(calls).toEqual([
      `connect ${EVENTS_URL}`,
      'start applications',
      'start market',
      'start install',
    ]);
  });

  // What lets a hidden section drop messages and refresh once on reveal.
  it("hands the services the mount's visibility", () => {
    setConfig(CONFIG);

    startSectionEvents(frame);

    expect(startApplicationsService).toHaveBeenCalledWith(frame.$visible);
    expect(startMarketService).toHaveBeenCalledWith(frame.$visible);
  });

  it('leaves the hub shut before the section has its configuration', () => {
    startSectionEvents(frame);

    expect(calls).toEqual([]);
  });
});

describe('stopSectionEvents', () => {
  it('stops every service', () => {
    stopSectionEvents();

    expect(calls).toEqual(['stop install', 'stop market', 'stop applications']);
  });
});
