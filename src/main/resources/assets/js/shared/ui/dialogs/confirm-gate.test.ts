import { describe, expect, it } from 'vitest';

import { matchesExpected } from './confirm-gate';

describe('matchesExpected', () => {
  it('accepts the value it was asked for, either side of the whitespace', () => {
    expect(matchesExpected('3', 3)).toBe(true);
    expect(matchesExpected('  3 ', 3)).toBe(true);
    expect(matchesExpected('jdoe', 'jdoe')).toBe(true);
  });

  it('refuses another spelling of the same number', () => {
    expect(matchesExpected('03', 3)).toBe(false);
    expect(matchesExpected('3.0', 3)).toBe(false);
    expect(matchesExpected('+3', 3)).toBe(false);
  });

  it('refuses a name that differs in case', () => {
    expect(matchesExpected('JDoe', 'jdoe')).toBe(false);
  });

  it('refuses a different value, and nothing at all', () => {
    expect(matchesExpected('2', 3)).toBe(false);
    expect(matchesExpected('', 3)).toBe(false);
    expect(matchesExpected('   ', 3)).toBe(false);
  });
});
