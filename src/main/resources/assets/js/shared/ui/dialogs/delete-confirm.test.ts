import { describe, expect, it } from 'vitest';

import { deleteExpectation, type DeleteTarget } from './delete-confirm';

function target(key: string, name: string): DeleteTarget {
  return { key, name, label: name };
}

describe('deleteExpectation', () => {
  it('asks for the name of the one item being deleted, not the key carrying it', () => {
    expect(deleteExpectation([target('user:system:jdoe', 'jdoe')])).toBe('jdoe');
  });

  it('asks for the count of a batch, which nobody would retype name by name', () => {
    expect(deleteExpectation([target('role:one', 'one'), target('role:two', 'two')])).toBe(2);
  });

  it('falls back to the count when there is nothing to delete', () => {
    expect(deleteExpectation([])).toBe(0);
  });
});
