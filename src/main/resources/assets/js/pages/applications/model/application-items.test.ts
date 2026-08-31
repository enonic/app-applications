import { describe, expect, it } from 'vitest';

import type { ApplicationItem } from '../../../entities/application';
import { byName } from './application-items';

function item(name: string, displayName = name): ApplicationItem {
  return { key: `com.enonic.app.booster:${name}`, name, displayName };
}

describe('byName', () => {
  it('sorts by the name that is rendered, not by display name', () => {
    const items = [item('quote', 'A quote'), item('embed')];

    expect(byName(items).map(({ name }) => name)).toEqual(['embed', 'quote']);
  });

  it('ignores case', () => {
    expect(byName([item('Zip'), item('apple')]).map(({ name }) => name)).toEqual(['apple', 'Zip']);
  });

  it('leaves the list it was given alone', () => {
    const items = [item('quote'), item('embed')];
    byName(items);

    expect(items.map(({ name }) => name)).toEqual(['quote', 'embed']);
  });
});
