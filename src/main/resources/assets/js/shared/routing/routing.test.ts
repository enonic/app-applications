import { describe, expect, it } from 'vitest';

import { itemKeyFromPath, itemPath, LIST_PATH } from './routing';

describe('itemPath', () => {
  it('puts a row under a segment of its own', () => {
    expect(itemPath('com.enonic.app.booster')).toBe('/com.enonic.app.booster');
  });

  it('round-trips through itemKeyFromPath', () => {
    expect(itemKeyFromPath(itemPath('com.enonic.app.booster'))).toBe('com.enonic.app.booster');
  });
});

describe('itemKeyFromPath', () => {
  it('reads the row a sub-path names', () => {
    expect(itemKeyFromPath('/com.enonic.app.booster')).toBe('com.enonic.app.booster');
  });

  it('takes a key the shell handed over without a leading slash', () => {
    expect(itemKeyFromPath('com.enonic.app.booster')).toBe('com.enonic.app.booster');
  });

  it('names no row for the list itself', () => {
    expect(itemKeyFromPath(LIST_PATH)).toBeUndefined();
    expect(itemKeyFromPath('/')).toBeUndefined();
  });

  it('ignores the search params', () => {
    expect(itemKeyFromPath('/com.enonic.app.booster?tab=tasks')).toBe('com.enonic.app.booster');
    expect(itemKeyFromPath('?tab=tasks')).toBeUndefined();
  });

  it('reads only the first segment, so a deeper path is still that row', () => {
    expect(itemKeyFromPath('/com.enonic.app.booster/tasks')).toBe('com.enonic.app.booster');
  });
});
