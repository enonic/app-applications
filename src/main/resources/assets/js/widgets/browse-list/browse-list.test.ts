import { describe, expect, it } from 'vitest';

import {
  type BrowseRow,
  contextMenuTarget,
  rowClickTarget,
  rowInteractions,
  shownRowKey,
  selectableKeys,
  selectAllState,
  toggledSelection,
} from './browse-list';

function row(key: string, disabled = false): BrowseRow {
  return { key, title: key, disabled };
}

function unselectableRow(key: string): BrowseRow {
  return { key, title: key, selectable: false };
}

describe('selectableKeys', () => {
  it('keeps the loaded rows in order', () => {
    expect(selectableKeys([row('a'), row('b')])).toEqual(['a', 'b']);
  });

  it('leaves out rows for work in flight', () => {
    expect(selectableKeys([row('a'), row('upload-1', true)])).toEqual(['a']);
  });

  it('leaves out a row that is not the operator’s to act on', () => {
    expect(selectableKeys([row('a'), unselectableRow('system')])).toEqual(['a']);
  });
});

describe('selectAllState', () => {
  it('is unchecked with nothing selected', () => {
    expect(selectAllState([row('a'), row('b')], new Set())).toBe(false);
  });

  it('is checked once every selectable row is selected', () => {
    expect(selectAllState([row('a'), row('b')], new Set(['a', 'b']))).toBe(true);
  });

  it('is indeterminate in between', () => {
    expect(selectAllState([row('a'), row('b')], new Set(['a']))).toBe('indeterminate');
  });

  it('ignores disabled rows when deciding it is checked', () => {
    expect(selectAllState([row('a'), row('upload-1', true)], new Set(['a']))).toBe(true);
  });

  it('is unchecked when there is nothing to select', () => {
    expect(selectAllState([], new Set())).toBe(false);
    expect(selectAllState([row('upload-1', true)], new Set())).toBe(false);
  });

  it('ignores unselectable rows when deciding it is checked', () => {
    expect(selectAllState([row('a'), unselectableRow('system')], new Set(['a']))).toBe(true);
  });

  it('ignores keys that no longer have a row', () => {
    expect(selectAllState([row('a')], new Set(['a', 'gone']))).toBe(true);
  });
});

describe('toggledSelection', () => {
  it('adds and removes the one key', () => {
    expect([...toggledSelection(new Set(['a']), 'b', true)]).toEqual(['a', 'b']);
    expect([...toggledSelection(new Set(['a', 'b']), 'a', false)]).toEqual(['b']);
  });

  it('leaves the given set alone', () => {
    const before = new Set(['a']);
    toggledSelection(before, 'b', true);

    expect([...before]).toEqual(['a']);
  });
});

describe('rowClickTarget', () => {
  it('activates the row that was clicked', () => {
    expect(rowClickTarget('b', new Set(), 'a')).toEqual({ clearSelection: false, activate: 'b' });
  });

  it('clears the active row on a second click, with nothing ticked', () => {
    expect(rowClickTarget('a', new Set(), 'a')).toEqual({
      clearSelection: false,
      deactivate: true,
    });
  });

  it('drops the ticks and activates, because the two are alternatives', () => {
    expect(rowClickTarget('c', new Set(['a', 'b']), 'a')).toEqual({
      clearSelection: true,
      activate: 'c',
    });
  });

  it('drops the ticks even when one of them is the row clicked', () => {
    expect(rowClickTarget('a', new Set(['a', 'b']), undefined)).toEqual({
      clearSelection: true,
      activate: 'a',
    });
  });

  it('keeps the active row where it is when the ticks go', () => {
    expect(rowClickTarget('a', new Set(['b']), 'a')).toEqual({ clearSelection: true });
  });
});

describe('contextMenuTarget', () => {
  it('keeps the ticked rows when one of them is right-clicked', () => {
    expect(contextMenuTarget('a', new Set(['a', 'b']), undefined)).toEqual({
      clearSelection: false,
    });
  });

  it('drops ticks that are not the right-clicked row and activates it', () => {
    expect(contextMenuTarget('c', new Set(['a', 'b']), 'a')).toEqual({
      clearSelection: true,
      activate: 'c',
    });
  });

  it('only activates when nothing is ticked', () => {
    expect(contextMenuTarget('c', new Set(), 'a')).toEqual({
      clearSelection: false,
      activate: 'c',
    });
  });

  it('does nothing on the active row with nothing ticked', () => {
    expect(contextMenuTarget('a', new Set(), 'a')).toEqual({
      clearSelection: false,
    });
  });
});

describe('shownRowKey', () => {
  it('takes the row ticked last, even over a ticked row already on show', () => {
    expect(shownRowKey(new Set(['a', 'b']), 'a')).toBe('b');
  });

  it('moves to the row ticked last when the row on show is not ticked', () => {
    expect(shownRowKey(new Set(['a', 'b']), 'c')).toBe('b');
  });

  it('falls back to the row ticked before, once the last one is unticked', () => {
    expect(shownRowKey(new Set(['a']), 'b')).toBe('a');
  });

  it('takes the row ticked last when nothing was on show', () => {
    expect(shownRowKey(new Set(['a', 'b']), undefined)).toBe('b');
  });

  it('leaves the row on show alone once the ticks are gone', () => {
    expect(shownRowKey(new Set(), 'b')).toBe('b');
  });

  it('has nothing to show with no ticks and nothing on show', () => {
    expect(shownRowKey(new Set(), undefined)).toBeUndefined();
  });
});

describe('rowInteractions', () => {
  const rows = [row('a'), row('b', true), unselectableRow('c')];

  it('lets a plain row be focused and ticked', () => {
    expect(rowInteractions(rows, true)('a')).toBe('full');
  });

  it('keeps work in flight out of the list entirely', () => {
    expect(rowInteractions(rows, true)('b')).toBe('none');
  });

  it('lets a row that cannot be ticked still take focus', () => {
    expect(rowInteractions(rows, true)('c')).toBe('navigate-only');
  });

  it('lets every row take focus but none be ticked while the list is not selectable', () => {
    const interactionOf = rowInteractions(rows, false);

    expect(interactionOf('a')).toBe('navigate-only');
    expect(interactionOf('b')).toBe('none');
  });

  it('knows nothing of a key without a row', () => {
    expect(rowInteractions(rows, true)('z')).toBe('none');
  });
});
