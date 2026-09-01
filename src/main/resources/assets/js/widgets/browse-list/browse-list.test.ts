import { describe, expect, it } from 'vitest';

import {
  type BrowseRow,
  contextMenuTarget,
  nextRowKey,
  rowClickTarget,
  shownRowKey,
  selectableKeys,
  selectAllState,
  tabbableRowKey,
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

describe('tabbableRowKey', () => {
  const rows = [row('a'), row('b')];

  it('gives the tab stop to the active row', () => {
    expect(tabbableRowKey(rows, 'b')).toBe('b');
  });

  it('falls back to the first row when the active row is not in the list', () => {
    expect(tabbableRowKey(rows, 'filtered-out')).toBe('a');
  });

  it('falls back to the first row when nothing is active', () => {
    expect(tabbableRowKey(rows, undefined)).toBe('a');
  });

  it('skips a row that cannot take focus', () => {
    expect(tabbableRowKey([row('upload-1', true), row('b')], undefined)).toBe('b');
  });

  // Not selectable is not the same as not navigable: the row still opens and takes the cursor.
  it('gives the tab stop to a row that cannot be ticked', () => {
    expect(tabbableRowKey([unselectableRow('system'), row('b')], undefined)).toBe('system');
  });

  it('has no tab stop in an empty list', () => {
    expect(tabbableRowKey([], 'a')).toBeUndefined();
  });
});

describe('nextRowKey', () => {
  const rows = [row('a'), row('b'), row('c')];

  it('steps down and up one row at a time', () => {
    expect(nextRowKey(rows, 'a', 'ArrowDown')).toBe('b');
    expect(nextRowKey(rows, 'b', 'ArrowUp')).toBe('a');
  });

  it('stops at both ends instead of wrapping', () => {
    expect(nextRowKey(rows, 'c', 'ArrowDown')).toBe('c');
    expect(nextRowKey(rows, 'a', 'ArrowUp')).toBe('a');
  });

  it('enters the list at the first row when nothing is active', () => {
    expect(nextRowKey(rows, undefined, 'ArrowDown')).toBe('a');
    expect(nextRowKey(rows, undefined, 'ArrowUp')).toBe('a');
  });

  it('jumps to the ends on Home and End', () => {
    expect(nextRowKey(rows, 'b', 'Home')).toBe('a');
    expect(nextRowKey(rows, 'b', 'End')).toBe('c');
  });

  it('skips rows for work in flight', () => {
    const withUpload = [row('a'), row('upload-1', true), row('c')];

    expect(nextRowKey(withUpload, 'a', 'ArrowDown')).toBe('c');
  });

  it('steps onto a row that cannot be ticked', () => {
    const withSystem = [row('a'), unselectableRow('system'), row('c')];

    expect(nextRowKey(withSystem, 'a', 'ArrowDown')).toBe('system');
  });

  it('re-enters at the first row when the active key is gone', () => {
    expect(nextRowKey(rows, 'gone', 'ArrowDown')).toBe('a');
  });

  it('ignores every other key', () => {
    expect(nextRowKey(rows, 'a', 'Enter')).toBeUndefined();
    expect(nextRowKey(rows, 'a', ' ')).toBeUndefined();
  });

  it('has nowhere to go in an empty list', () => {
    expect(nextRowKey([], undefined, 'ArrowDown')).toBeUndefined();
  });
});
