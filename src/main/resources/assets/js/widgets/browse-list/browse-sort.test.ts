import { describe, expect, it } from 'vitest';

import { sortByDisplayName, sortByValue } from './browse-sort';

function item(key: string, displayName: string) {
  return { key, displayName };
}

const items = [item('c', 'Expert'), item('a', 'Administrator'), item('b', 'browser')];

describe('sortByDisplayName', () => {
  it('orders by display name, ignoring case', () => {
    expect(sortByDisplayName(items, 'asc').map(({ key }) => key)).toEqual(['a', 'b', 'c']);
  });

  it('reverses on desc', () => {
    expect(sortByDisplayName(items, 'desc').map(({ key }) => key)).toEqual(['c', 'b', 'a']);
  });

  it('breaks a tie on the key, so two items named alike keep a stable order', () => {
    const tied = [item('b.editor', 'Editor'), item('a.editor', 'Editor')];

    expect(sortByDisplayName(tied, 'asc').map(({ key }) => key)).toEqual(['a.editor', 'b.editor']);
  });

  it('leaves the items it was given alone', () => {
    const original = [...items];
    sortByDisplayName(items, 'desc');

    expect(items).toEqual(original);
  });

  it('answers an empty list unchanged', () => {
    expect(sortByDisplayName([], 'asc')).toEqual([]);
  });
});

describe('sortByValue', () => {
  const principals = [
    item('user:ldap:zoe', 'Zoe'),
    item('user:system:adam', 'Adam'),
    item('user:ldap:adam', 'Adam'),
  ];

  const providerOf = ({ key }: { key: string }) => key.split(':')[1] ?? '';

  it('groups by the value, ordering by display name inside each group', () => {
    expect(sortByValue(principals, 'asc', providerOf).map(({ key }) => key)).toEqual([
      'user:ldap:adam',
      'user:ldap:zoe',
      'user:system:adam',
    ]);
  });

  it('reverses the groups alone on desc, so the names inside one stay ascending', () => {
    expect(sortByValue(principals, 'desc', providerOf).map(({ key }) => key)).toEqual([
      'user:system:adam',
      'user:ldap:adam',
      'user:ldap:zoe',
    ]);
  });

  it('breaks a tie on the key once the value and the display name both match', () => {
    const tied = [item('user:ldap:b', 'Adam'), item('user:ldap:a', 'Adam')];

    expect(sortByValue(tied, 'desc', providerOf).map(({ key }) => key)).toEqual([
      'user:ldap:a',
      'user:ldap:b',
    ]);
  });

  it('ignores case in the value', () => {
    const mixed = [item('a', 'A'), item('b', 'B')];

    expect(
      sortByValue(mixed, 'asc', ({ key }) => (key === 'a' ? 'ldap' : 'Azure')).map(
        ({ key }) => key,
      ),
    ).toEqual(['b', 'a']);
  });

  it('leaves the items it was given alone', () => {
    const original = [...principals];
    sortByValue(principals, 'desc', providerOf);

    expect(principals).toEqual(original);
  });
});
