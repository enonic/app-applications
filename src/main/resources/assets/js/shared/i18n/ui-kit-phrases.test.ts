import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { filterInputPhrases, uiKitPhrases } from '@enonic/ui-kit';
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

describe('phrases.properties against the kit', () => {
  it('carries every label the kit renders on its own, placeholders and all', () => {
    const bundle = readBundle();

    for (const phrases of [uiKitPhrases, filterInputPhrases]) {
      expect(comparePhrases(phrases, bundle)).toEqual({ missing: [], placeholderMismatch: [] });
    }
  });
});
