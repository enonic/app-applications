import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { themeSwitcherPhrases, uiKitPhrases } from '@enonic/ui-kit';
import { comparePhrases, type Phrases } from '@enonic/ui-utils';
import { describe, expect, it } from 'vitest';

const BUNDLE = join(__dirname, '../../../../i18n/phrases.properties');

function readBundle(): Phrases {
  const phrases: Record<string, string> = {};

  for (const line of readFileSync(BUNDLE, 'utf8').split('\n')) {
    const separator = line.indexOf('=');
    if (line.startsWith('#') || separator === -1) {
      continue;
    }
    phrases[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }

  return phrases;
}

// The app renders no theme switcher: the host owns the theme.
const rendered: Phrases = Object.fromEntries(
  Object.entries(uiKitPhrases).filter(([key]) => !(key in themeSwitcherPhrases)),
);

describe('phrases.properties against the kit', () => {
  it('carries every label the kit renders here, placeholders and all', () => {
    expect(comparePhrases(rendered, readBundle())).toEqual({
      missing: [],
      placeholderMismatch: [],
    });
  });
});
