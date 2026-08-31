import { describe, expect, it } from 'vitest';

import { matchesExpected } from './confirm-gate';

describe('matchesExpected', () => {
  it('accepts the value it was asked for, either side of the whitespace', () => {
    expect(matchesExpected('3', 3)).toBe(true);
    expect(matchesExpected('  3 ', 3)).toBe(true);
    expect(matchesExpected('booster', 'booster')).toBe(true);
  });

  // Compared as text, so nothing that merely adds up to the number gets through.
  it('refuses another spelling of the same number', () => {
    expect(matchesExpected('03', 3)).toBe(false);
    expect(matchesExpected('3.0', 3)).toBe(false);
    expect(matchesExpected('+3', 3)).toBe(false);
  });

  it('refuses a different value, and nothing at all', () => {
    expect(matchesExpected('2', 3)).toBe(false);
    expect(matchesExpected('', 3)).toBe(false);
    expect(matchesExpected('   ', 3)).toBe(false);
  });
});
