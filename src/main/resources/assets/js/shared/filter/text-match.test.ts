import { describe, expect, it } from 'vitest';

import { matchesEveryWord } from './text-match';

const fields = ['Alice Ward', 'Ward staff'];

describe('matchesEveryWord', () => {
  it('matches everything for a blank query', () => {
    expect(matchesEveryWord('   ', fields)).toBe(true);
  });

  it('matches a word from its start in any field, whatever the case', () => {
    expect(matchesEveryWord('STAFF', fields)).toBe(true);
    expect(matchesEveryWord('ali', fields)).toBe(true);
  });

  it('does not match inside a word, as the server does not', () => {
    expect(matchesEveryWord('lic', fields)).toBe(false);
  });

  it('ignores diacritics on either side', () => {
    expect(matchesEveryWord('jose', ['José Núñez'])).toBe(true);
    expect(matchesEveryWord('núñez', ['Jose Nunez'])).toBe(true);
  });

  it('splits words on punctuation, so a key or a hyphenated name matches by its parts', () => {
    expect(matchesEveryWord('admin', ['system.user.admin'])).toBe(true);
    expect(matchesEveryWord('smith', ['Anna Jones-Smith'])).toBe(true);
  });

  it('needs every word, in any order and across fields', () => {
    expect(matchesEveryWord('ward alice', fields)).toBe(true);
    expect(matchesEveryWord('alice staff', fields)).toBe(true);
    expect(matchesEveryWord('alice bob', fields)).toBe(false);
  });

  it('skips the fields a row does not have', () => {
    expect(matchesEveryWord('alice', ['Alice Ward', undefined])).toBe(true);
    expect(matchesEveryWord('alice', [undefined])).toBe(false);
  });
});
