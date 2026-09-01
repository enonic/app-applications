import { describe, expect, it } from 'vitest';

import { createSelectionStore } from './selection.store';

describe('createSelectionStore', () => {
  it('starts empty', () => {
    const selection = createSelectionStore();

    expect(selection.$selected.get().size).toBe(0);
  });

  it('flips a key when no explicit state is given', () => {
    const selection = createSelectionStore();

    selection.toggle('a');
    expect(selection.$selected.get().has('a')).toBe(true);

    selection.toggle('a');
    expect(selection.$selected.get().has('a')).toBe(false);
  });

  it('honours the explicit state instead of flipping', () => {
    const selection = createSelectionStore();

    selection.toggle('a', true);
    selection.toggle('a', true);

    expect([...selection.$selected.get()]).toEqual(['a']);
  });

  it('keeps the same set instance when nothing changes', () => {
    const selection = createSelectionStore();
    selection.toggle('a', true);

    const before = selection.$selected.get();
    selection.toggle('a', true);

    expect(selection.$selected.get()).toBe(before);
  });

  it('replaces the whole selection', () => {
    const selection = createSelectionStore();
    selection.toggle('a', true);

    selection.replace(['b', 'c']);

    expect([...selection.$selected.get()]).toEqual(['b', 'c']);
  });

  it('drops every key on clear', () => {
    const selection = createSelectionStore();
    selection.replace(['a', 'b']);

    selection.clear();

    expect(selection.$selected.get().size).toBe(0);
  });

  it('notifies subscribers on a real change only', () => {
    const selection = createSelectionStore();
    const seen: number[] = [];
    const unsubscribe = selection.$selected.subscribe((selected) => seen.push(selected.size));

    selection.toggle('a', true);
    selection.toggle('a', true);
    selection.clear();
    selection.clear();

    unsubscribe();
    expect(seen).toEqual([0, 1, 0]);
  });
});
