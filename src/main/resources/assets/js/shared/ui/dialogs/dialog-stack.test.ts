import { describe, expect, it } from 'vitest';

import { layerOf } from './dialog-stack';

describe('layerOf', () => {
  it('reports a lone dialog as neither blocked nor nested', () => {
    expect(layerOf([1], 1)).toEqual({ blocked: false, nested: false });
  });

  it('reports the one underneath as blocked', () => {
    expect(layerOf([1, 2], 1)).toEqual({ blocked: true, nested: false });
  });

  it('reports the one on top as nested but free to act', () => {
    expect(layerOf([1, 2], 2)).toEqual({ blocked: false, nested: true });
  });

  it('blocks everything below the top of a deeper stack', () => {
    expect(layerOf([1, 2, 3], 2).blocked).toBe(true);
    expect(layerOf([1, 2, 3], 3).blocked).toBe(false);
  });

  it('reports a closed dialog as neither', () => {
    expect(layerOf([1, 2], 9)).toEqual({ blocked: false, nested: false });
  });
});
