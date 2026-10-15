import { describe, expect, it, vi } from 'vitest';

const connectAdminEvents = vi.hoisted(() => vi.fn());
vi.mock('../shared/admin-events', () => ({ connectAdminEvents }));

import { startSectionEvents } from './events';

const EVENTS_URL = '/_/admin:events';

describe('startSectionEvents', () => {
  it('connects to the hub at the url the section was configured with', () => {
    startSectionEvents(EVENTS_URL);

    expect(connectAdminEvents).toHaveBeenCalledExactlyOnceWith(EVENTS_URL);
  });
});
