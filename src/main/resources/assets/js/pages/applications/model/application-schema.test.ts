import { describe, expect, it } from 'vitest';

import type { ApplicationInfo, ApplicationItem } from '../../../entities/application';
import { schemaGroups } from './application-schema';

function item(name: string): ApplicationItem {
  return { key: `com.enonic.app.booster:${name}`, name, displayName: name };
}

function info(overrides: Partial<ApplicationInfo> = {}): ApplicationInfo {
  return {
    contentTypes: [],
    mixins: [],
    formFragments: [],
    pages: [],
    parts: [],
    layouts: [],
    macros: [],
    tasks: [],
    adminTools: [],
    adminExtensions: [],
    apis: [],
    ...overrides,
  };
}

describe('schemaGroups', () => {
  it('lists the groups in mockup order, macros last', () => {
    const groups = schemaGroups(
      info({
        contentTypes: [item('article')],
        mixins: [item('address')],
        formFragments: [item('seo')],
        pages: [item('main')],
        parts: [item('heading')],
        layouts: [item('two-column')],
        macros: [item('embed')],
      }),
    );

    expect(groups.map(({ labelKey }) => labelKey)).toEqual([
      'applications.details.contentTypes',
      'applications.details.pages',
      'applications.details.parts',
      'applications.details.layouts',
      'applications.details.mixins',
      'applications.details.formFragments',
      'applications.details.macros',
    ]);
  });

  // Macros used to be a section of their own, so an application shipping only macros still has to
  // reach the panel.
  it('carries macros on an application that contributes no schemas', () => {
    const groups = schemaGroups(info({ macros: [item('embed')] }));

    expect(groups).toEqual([{ labelKey: 'applications.details.macros', items: [item('embed')] }]);
  });

  it('drops a group the application contributes nothing to', () => {
    const groups = schemaGroups(info({ parts: [item('heading')] }));

    expect(groups).toEqual([{ labelKey: 'applications.details.parts', items: [item('heading')] }]);
  });

  it('sorts a group by the name it renders, not by display name', () => {
    const groups = schemaGroups(
      info({ pages: [{ ...item('websocket'), displayName: 'A page' }, item('attachments')] }),
    );

    expect(groups[0]?.items.map(({ name }) => name)).toEqual(['attachments', 'websocket']);
  });

  it('leaves the lists it was given alone', () => {
    const pages = [item('websocket'), item('attachments')];
    schemaGroups(info({ pages }));

    expect(pages.map(({ name }) => name)).toEqual(['websocket', 'attachments']);
  });

  it('has no groups without info', () => {
    expect(schemaGroups(undefined)).toEqual([]);
  });

  it('has no groups for an application that contributes nothing', () => {
    expect(schemaGroups(info())).toEqual([]);
  });
});
