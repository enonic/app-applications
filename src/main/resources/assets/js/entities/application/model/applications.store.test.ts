import { err, ok } from 'neverthrow';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppError } from '../../../shared/api';
import type { Application } from './application.types';
import {
  $applications,
  beginApplicationsLoad,
  isApplicationsCached,
  receiveApplication,
  receiveApplications,
  removeApplication,
} from './applications.store';

function application(key: string, displayName = key): Application {
  return { key, displayName, version: '1.0.0', state: 'STARTED', system: false, local: false };
}

const booster = application('com.enonic.app.booster', 'Booster');

beforeEach(() => {
  $applications.set({ status: 'loading', items: [] });
});

describe('beginApplicationsLoad', () => {
  it('waits on a skeleton while there is nothing to show', () => {
    $applications.set({ status: 'ready', items: [] });

    beginApplicationsLoad();

    expect($applications.get().status).toBe('loading');
  });

  // A reconnect and an install event elsewhere both reload the list; blanking it would read as a
  // flash the user did not ask for.
  it('leaves a list that is already on screen alone', () => {
    $applications.set({ status: 'ready', items: [booster] });

    beginApplicationsLoad();

    expect($applications.get().status).toBe('ready');
    expect($applications.get().items).toEqual([booster]);
  });
});

describe('receiveApplications', () => {
  it('publishes the list it was handed', () => {
    receiveApplications(ok([booster]));

    expect($applications.get()).toEqual({ status: 'ready', items: [booster] });
  });

  it('reports a failure with nothing to show, because the list is what failed', () => {
    receiveApplications(ok([booster]));

    receiveApplications(err(new AppError('Endpoint is down')));

    expect($applications.get()).toEqual({
      status: 'error',
      items: [],
      error: 'Endpoint is down',
    });
  });
});

describe('receiveApplication', () => {
  it('replaces one row and keeps display-name order', () => {
    $applications.set({
      status: 'ready',
      items: [application('a', 'alpha'), application('z', 'Zebra')],
    });

    receiveApplication(application('m', 'Middle'));

    expect($applications.get().items.map(({ displayName }) => displayName)).toEqual([
      'alpha',
      'Middle',
      'Zebra',
    ]);
  });
});

describe('removeApplication', () => {
  beforeEach(() => {
    $applications.set({ status: 'ready', items: [booster] });
  });

  it('drops the row it names', () => {
    removeApplication(booster.key);

    expect($applications.get().items).toEqual([]);
  });

  it('leaves a list the key is not in alone', () => {
    removeApplication('org.example.unknown');

    expect($applications.get().items).toEqual([booster]);
  });
});

describe('isApplicationsCached', () => {
  it('is true only once a list has arrived', () => {
    expect(isApplicationsCached()).toBe(false);

    receiveApplications(ok([booster]));

    expect(isApplicationsCached()).toBe(true);
  });
});
