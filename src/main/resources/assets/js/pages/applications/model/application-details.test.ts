import { describe, expect, it } from 'vitest';

import { systemVersionRequirement } from './application-details';

describe('systemVersionRequirement', () => {
  it('reads an inclusive lower and exclusive upper bound', () => {
    expect(systemVersionRequirement('[8.1.0,9.0.0)')).toBe('≥ 8.1.0, < 9.0.0');
  });

  it('reads two inclusive bounds', () => {
    expect(systemVersionRequirement('[8.1.0,9.0.0]')).toBe('≥ 8.1.0, ≤ 9.0.0');
  });

  it('reads two exclusive bounds', () => {
    expect(systemVersionRequirement('(8.1.0,9.0.0)')).toBe('> 8.1.0, < 9.0.0');
  });

  it('reads an exclusive lower and inclusive upper bound', () => {
    expect(systemVersionRequirement('(8.1.0,9.0.0]')).toBe('> 8.1.0, ≤ 9.0.0');
  });

  it('reads a bare version as an inclusive lower bound', () => {
    expect(systemVersionRequirement('8.1.0')).toBe('≥ 8.1.0');
  });

  it('shows a range it does not recognise as reported', () => {
    expect(systemVersionRequirement('[8.1.0,')).toBe('[8.1.0,');
    expect(systemVersionRequirement('[8.1.0')).toBe('[8.1.0');
    expect(systemVersionRequirement('8.1.0)')).toBe('8.1.0)');
  });

  it('has nothing to say about a descriptor that names no range', () => {
    expect(systemVersionRequirement()).toBeUndefined();
    expect(systemVersionRequirement('')).toBeUndefined();
  });
});
