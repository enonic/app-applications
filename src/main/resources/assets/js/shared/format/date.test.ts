import { describe, expect, it } from 'vitest';

import { formatDate, formatDateTime } from './date';

describe('formatDate', () => {
  it('formats an ISO timestamp in the given locale', () => {
    expect(formatDate('2026-07-29T12:00:00Z', 'en-GB')).toBe('29 Jul 2026');
  });

  it('accepts a Date and a millisecond timestamp alike', () => {
    const date = new Date('2026-07-29T12:00:00Z');

    expect(formatDate(date, 'en-GB')).toBe(formatDate(date.getTime(), 'en-GB'));
  });

  it('resolves an unparseable value to an empty string', () => {
    expect(formatDate('not a date', 'en-GB')).toBe('');
  });
});

describe('formatDateTime', () => {
  it('keeps the date part and adds a time', () => {
    const formatted = formatDateTime('2026-07-29T12:00:00Z', 'en-GB');

    expect(formatted.startsWith('29 Jul 2026')).toBe(true);
    expect(formatted.length).toBeGreaterThan('29 Jul 2026'.length);
  });

  it('resolves an unparseable value to an empty string', () => {
    expect(formatDateTime(Number.NaN, 'en-GB')).toBe('');
  });
});
