import { err, ok } from 'neverthrow';
import { beforeEach, describe, expect, it } from 'vitest';

import { AppError } from '../../../shared/api';
import {
  $marketApplications,
  beginMarketLoad,
  isMarketCached,
  receiveMarketApplications,
} from './market.store';
import type { MarketApplication } from './market.types';

function marketApplication(key: string): MarketApplication {
  return {
    key,
    displayName: key,
    latest: { version: '8.0.0', downloadUrl: `https://repo.enonic.com/${key}-8.0.0.jar` },
    updateAvailable: false,
    installedAhead: false,
  };
}

const guillotine = marketApplication('com.enonic.app.guillotine');

beforeEach(() => {
  $marketApplications.set({ status: 'loading', items: [] });
});

describe('beginMarketLoad', () => {
  it('waits on a skeleton while there is nothing to show', () => {
    $marketApplications.set({ status: 'ready', items: [] });

    beginMarketLoad();

    expect($marketApplications.get().status).toBe('loading');
  });

  it('leaves a catalogue already on screen alone', () => {
    $marketApplications.set({ status: 'ready', items: [guillotine] });

    beginMarketLoad();

    expect($marketApplications.get()).toEqual({ status: 'ready', items: [guillotine] });
  });
});

describe('receiveMarketApplications', () => {
  it('reports the applications the market offered', () => {
    receiveMarketApplications(ok([guillotine]));

    expect($marketApplications.get()).toEqual({ status: 'ready', items: [guillotine] });
  });

  it('reports a failure with the message, keeping nothing stale', () => {
    receiveMarketApplications(ok([guillotine]));
    receiveMarketApplications(err(new AppError('Enonic Market answered 503')));

    expect($marketApplications.get()).toEqual({
      status: 'error',
      items: [],
      error: 'Enonic Market answered 503',
    });
  });
});

describe('isMarketCached', () => {
  it('reads an empty but loaded catalogue as cached, so no second call is made', () => {
    receiveMarketApplications(ok([]));

    expect(isMarketCached()).toBe(true);
  });

  it('reads a failed load as not cached', () => {
    receiveMarketApplications(err(new AppError('nope')));

    expect(isMarketCached()).toBe(false);
  });
});
