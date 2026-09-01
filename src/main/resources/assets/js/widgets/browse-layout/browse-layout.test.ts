import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clampDetailsWidth,
  DEFAULT_DETAILS_WIDTH,
  MIN_DETAILS_WIDTH,
  MIN_LIST_WIDTH,
  readDetailsWidth,
  writeDetailsWidth,
} from './browse-layout';

function stubStorage(stored: Record<string, string> = {}) {
  const storage = {
    getItem: (key: string) => stored[key] ?? null,
    setItem: (key: string, value: string) => {
      stored[key] = value;
    },
  };

  vi.stubGlobal('localStorage', storage);
  return stored;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('clampDetailsWidth', () => {
  it('keeps a width both columns can live with', () => {
    expect(clampDetailsWidth(450, 1200)).toBe(450);
  });

  it('stops at the details minimum', () => {
    expect(clampDetailsWidth(10, 1200)).toBe(MIN_DETAILS_WIDTH);
  });

  it('leaves the list its minimum', () => {
    expect(clampDetailsWidth(1100, 1200)).toBe(1200 - MIN_LIST_WIDTH);
  });

  it('gives the details column its minimum in a window too narrow for both', () => {
    expect(clampDetailsWidth(400, 400)).toBe(MIN_DETAILS_WIDTH);
  });

  it('rounds to whole pixels', () => {
    expect(clampDetailsWidth(450.6, 1200)).toBe(451);
  });
});

describe('readDetailsWidth', () => {
  it('falls back to the default where there is no storage to read', () => {
    expect(readDetailsWidth()).toBe(DEFAULT_DETAILS_WIDTH);
  });

  it('reads back the width it wrote', () => {
    stubStorage();

    writeDetailsWidth(520);

    expect(readDetailsWidth()).toBe(520);
  });

  it('falls back to the default on a stored value that is not a width', () => {
    const stored = stubStorage();
    writeDetailsWidth(520);
    const [key] = Object.keys(stored);
    stored[key] = 'wide';

    expect(readDetailsWidth()).toBe(DEFAULT_DETAILS_WIDTH);
  });
});
