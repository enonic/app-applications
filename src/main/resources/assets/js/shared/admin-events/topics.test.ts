import { describe, expect, it } from 'vitest';

import { toApplicationProgressMessage } from './topics';

const DOWNLOAD_URL = 'https://repo/app-1.0.0.jar';

describe('toApplicationProgressMessage', () => {
  it('reads a download and how far it has got', () => {
    expect(toApplicationProgressMessage({ url: DOWNLOAD_URL, percent: 42 })).toEqual({
      url: DOWNLOAD_URL,
      percent: 42,
    });
  });

  it('keeps both ends of the range', () => {
    expect(toApplicationProgressMessage({ url: DOWNLOAD_URL, percent: 0 })?.percent).toBe(0);
    expect(toApplicationProgressMessage({ url: DOWNLOAD_URL, percent: 100 })?.percent).toBe(100);
  });

  it('refuses a message it cannot key', () => {
    expect(toApplicationProgressMessage({ percent: 42 })).toBeUndefined();
    expect(toApplicationProgressMessage({ url: '', percent: 42 })).toBeUndefined();
    expect(toApplicationProgressMessage({ url: 7, percent: 42 })).toBeUndefined();
  });

  it('refuses a percent that cannot be a width', () => {
    expect(toApplicationProgressMessage({ url: DOWNLOAD_URL })).toBeUndefined();
    expect(toApplicationProgressMessage({ url: DOWNLOAD_URL, percent: '42' })).toBeUndefined();
    expect(
      toApplicationProgressMessage({ url: DOWNLOAD_URL, percent: Number.NaN }),
    ).toBeUndefined();
    expect(
      toApplicationProgressMessage({ url: DOWNLOAD_URL, percent: Number.POSITIVE_INFINITY }),
    ).toBeUndefined();
    expect(toApplicationProgressMessage({ url: DOWNLOAD_URL, percent: -1 })).toBeUndefined();
    expect(toApplicationProgressMessage({ url: DOWNLOAD_URL, percent: 101 })).toBeUndefined();
  });

  it('refuses anything that is not a payload at all', () => {
    expect(toApplicationProgressMessage(undefined)).toBeUndefined();
    expect(toApplicationProgressMessage(null)).toBeUndefined();
    expect(toApplicationProgressMessage('42')).toBeUndefined();
  });
});
