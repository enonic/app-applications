import { atom } from 'nanostores';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { HUB_TOPICS, type TopicHandlers } from '../../../shared/admin-events';
import { $applicationsInfo, invalidateApplicationInfo } from './application-info.store';
import { loadApplication, loadApplications } from './applications.load';
import { start, stop, toApplicationChange } from './applications.service';
import { $applications, removeApplication } from './applications.store';

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

vi.mock('./application-info.store', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./application-info.store')>()),
  invalidateApplicationInfo: vi.fn(),
}));

vi.mock('./applications.load', () => ({
  loadApplication: vi.fn(),
  loadApplications: vi.fn(),
}));

vi.mock('./applications.store', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./applications.store')>()),
  removeApplication: vi.fn(),
}));

/** What the hub publishes on the topic: ids, never data. */
function message(eventType: string, key?: string): unknown {
  return { eventType, key };
}

// The reaction gathers a window of messages before it applies them.
const WINDOW_MS = 300;

const $visible = atom(true);

function emit(...data: unknown[]): void {
  data.forEach((entry) =>
    subscribed.handlers.forEach((handlers) => (handlers as TopicHandlers).onMessage(entry)),
  );
  vi.advanceTimersByTime(WINDOW_MS);
}

function emitLoss(count: number | null): void {
  subscribed.handlers.forEach((handlers) => (handlers as TopicHandlers).onLoss?.(count));
}

describe('toApplicationChange', () => {
  it('reads the three terminal lifecycle events as a change to one application', () => {
    expect(toApplicationChange(message('STARTED', 'a'))).toEqual({ kind: 'changed', key: 'a' });
    expect(toApplicationChange(message('STOPPED', 'a'))).toEqual({ kind: 'changed', key: 'a' });
    expect(toApplicationChange(message('UPDATED', 'a'))).toEqual({ kind: 'changed', key: 'a' });
  });

  it('tells an install and an uninstall apart from a change', () => {
    expect(toApplicationChange(message('INSTALLED', 'a'))).toEqual({ kind: 'installed', key: 'a' });
    expect(toApplicationChange(message('UNINSTALLED', 'a'))).toEqual({
      kind: 'uninstalled',
      key: 'a',
    });
  });

  it('skips the transient states between the terminal ones', () => {
    for (const transient of ['STARTING', 'STOPPING', 'RESOLVED', 'UNRESOLVED']) {
      expect(toApplicationChange(message(transient, 'a'))).toBeUndefined();
    }
  });

  it('skips a payload it cannot read, and one naming no application', () => {
    expect(toApplicationChange(undefined)).toBeUndefined();
    expect(toApplicationChange('INSTALLED')).toBeUndefined();
    expect(toApplicationChange({ key: 'a' })).toBeUndefined();
    expect(toApplicationChange(message('STARTED'))).toBeUndefined();
  });
});

describe('the applications service', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    subscribed.handlers = [];
    subscribed.topics = [];
    vi.mocked(loadApplication).mockReset();
    vi.mocked(loadApplications).mockReset();
    vi.mocked(removeApplication).mockReset();
    vi.mocked(invalidateApplicationInfo).mockReset();
    $applications.set({ status: 'ready', items: [] });
    $applicationsInfo.set({});
    $visible.set(true);
    start($visible);
  });

  afterEach(() => {
    stop();
    vi.useRealTimers();
  });

  it('subscribes the hub-owned applications topic once, however often it is started', () => {
    start($visible);

    expect(subscribed.handlers).toHaveLength(1);
    expect(subscribed.topics).toEqual([HUB_TOPICS.applications]);
  });

  it('refetches the one application a state change names', () => {
    emit(message('STOPPED', 'com.enonic.app.booster'));

    expect(loadApplication).toHaveBeenCalledExactlyOnceWith('com.enonic.app.booster');
    expect(loadApplications).not.toHaveBeenCalled();
  });

  it('reloads the whole list for an application that was not there before', () => {
    emit(message('INSTALLED', 'com.enonic.app.fathom'));

    expect(loadApplications).toHaveBeenCalledTimes(1);
  });

  it('drops an uninstalled application without asking the server', () => {
    emit(message('UNINSTALLED', 'com.enonic.app.fathom'));

    expect(removeApplication).toHaveBeenCalledWith('com.enonic.app.fathom');
    expect(loadApplications).not.toHaveBeenCalled();
    expect(loadApplication).not.toHaveBeenCalled();
  });

  it('forgets what the application provides, whatever the change was', () => {
    emit(message('UPDATED', 'com.enonic.app.booster'));

    expect(invalidateApplicationInfo).toHaveBeenCalledWith('com.enonic.app.booster');
  });

  it('ignores a message it cannot read as a change', () => {
    emit(message('STARTING', 'com.enonic.app.booster'));

    expect(invalidateApplicationInfo).not.toHaveBeenCalled();
    expect(loadApplication).not.toHaveBeenCalled();
  });

  it('applies a burst as one batch, an application refetched once', () => {
    emit(
      message('STOPPED', 'com.enonic.app.booster'),
      message('STARTED', 'com.enonic.app.booster'),
      message('UPDATED', 'com.enonic.app.booster'),
    );

    expect(loadApplication).toHaveBeenCalledExactlyOnceWith('com.enonic.app.booster');
  });

  // An install is followed by its start: the start must not refetch a row the list does not have yet.
  it('keeps an install an install through the changes after it', () => {
    emit(
      message('INSTALLED', 'com.enonic.app.fathom'),
      message('STARTED', 'com.enonic.app.fathom'),
    );

    expect(loadApplications).toHaveBeenCalledTimes(1);
    expect(loadApplication).not.toHaveBeenCalled();
  });

  it('reloads the list once for a batch too large to refetch by key', () => {
    emit(
      ...Array.from({ length: 11 }, (_, index) => message('STARTED', `com.enonic.app.${index}`)),
    );

    expect(loadApplications).toHaveBeenCalledTimes(1);
    expect(loadApplication).not.toHaveBeenCalled();
  });

  // The hub never replays what a subscriber missed, so the gap itself is the only signal there is.
  it('reloads the list and forgets every application on a loss', () => {
    $applicationsInfo.set({ 'com.enonic.app.booster': { status: 'ready' } });

    emitLoss(3);

    expect(loadApplications).toHaveBeenCalledTimes(1);
    expect(invalidateApplicationInfo).toHaveBeenCalledWith('com.enonic.app.booster');
  });

  it('drops what arrives while hidden and refreshes once on reveal', () => {
    $visible.set(false);
    emit(
      message('STOPPED', 'com.enonic.app.booster'),
      message('INSTALLED', 'com.enonic.app.fathom'),
    );

    expect(loadApplication).not.toHaveBeenCalled();
    expect(loadApplications).not.toHaveBeenCalled();

    $visible.set(true);

    expect(loadApplications).toHaveBeenCalledTimes(1);
    expect(loadApplication).not.toHaveBeenCalled();
  });

  it('leaves a list it never loaded alone, on a loss and on an install alike', () => {
    $applications.set({ status: 'loading', items: [] });

    emitLoss(3);
    emit(message('INSTALLED', 'com.enonic.app.fathom'));

    expect(loadApplications).not.toHaveBeenCalled();
  });

  it('stops listening once it is stopped', () => {
    stop();
    emit(message('STOPPED', 'com.enonic.app.booster'));

    expect(subscribed.handlers).toHaveLength(0);
    expect(loadApplication).not.toHaveBeenCalled();
  });
});
