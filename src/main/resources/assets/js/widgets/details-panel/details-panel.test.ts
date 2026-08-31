import { describe, expect, it } from 'vitest';

import { detailsEmptyLabelKey, filledSections, withCount } from './details-panel';

describe('detailsEmptyLabelKey', () => {
  // ! The distinction the panel exists to make: a debounced by-key load would otherwise read as a click
  // ! that did nothing.
  it('says a selection is on its way while one is loading', () => {
    expect(detailsEmptyLabelKey('loading', 'roles.details.failed')).toBe('browse.details.loading');
  });

  it("names what failed with the section's own phrase", () => {
    expect(detailsEmptyLabelKey('error', 'roles.details.failed')).toBe('roles.details.failed');
  });

  // Nothing selected and a key nothing answers to are the same empty column.
  it('falls back to the empty column for anything else', () => {
    expect(detailsEmptyLabelKey('idle', 'roles.details.failed')).toBe('browse.details.empty');
    expect(detailsEmptyLabelKey('ready', 'roles.details.failed')).toBe('browse.details.empty');
  });
});

describe('withCount', () => {
  it('appends the count in brackets', () => {
    expect(withCount('Members', 8)).toBe('Members (8)');
  });

  it('keeps a count of zero, which is not the same as having none', () => {
    expect(withCount('Members', 0)).toBe('Members (0)');
  });

  it('leaves the label alone when there is no count', () => {
    expect(withCount('Role', undefined)).toBe('Role');
  });
});

describe('filledSections', () => {
  it('keeps the sections that have items, in order', () => {
    const sections = [
      { labelKey: 'users', items: ['a'] },
      { labelKey: 'groups', items: [] },
      { labelKey: 'roles', items: ['b', 'c'] },
    ];

    expect(filledSections(sections).map(({ labelKey }) => labelKey)).toEqual(['users', 'roles']);
  });

  it('drops everything when nothing has items', () => {
    expect(filledSections([{ labelKey: 'users', items: [] }])).toEqual([]);
  });
});
