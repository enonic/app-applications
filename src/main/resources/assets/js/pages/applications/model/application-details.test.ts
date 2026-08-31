import { describe, expect, it } from 'vitest';

import { systemVersionPhrase } from './application-details';

describe('systemVersionPhrase', () => {
  it('reads a lower bound alone as an open range', () => {
    expect(systemVersionPhrase('7.15.0')).toEqual({
      labelKey: 'applications.details.systemVersionFrom',
      args: ['7.15.0'],
    });
  });

  it('reads an upper bound alone', () => {
    expect(systemVersionPhrase(undefined, '8.0.0')).toEqual({
      labelKey: 'applications.details.systemVersionUpTo',
      args: ['8.0.0'],
    });
  });

  it('reads both bounds as a range', () => {
    expect(systemVersionPhrase('7.15.0', '8.0.0')).toEqual({
      labelKey: 'applications.details.systemVersionRange',
      args: ['7.15.0', '8.0.0'],
    });
  });

  it('has nothing to say about a descriptor that names no bound', () => {
    expect(systemVersionPhrase()).toBeUndefined();
  });
});
