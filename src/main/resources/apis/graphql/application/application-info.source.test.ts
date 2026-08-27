import { listAdminExtensions, type AdminExtensionDescriptor } from '/lib/admin-extension';
import { listAdminTools, type AdminToolDescriptor } from '/lib/admin-tool';
import { listApis, type ApiDescriptor } from '/lib/api';
import { getIdProviderDescriptor } from '/lib/idprovider';
import { listMacros, type MacroDescriptor } from '/lib/macro';
import { listTaskDescriptors, type TaskDescriptor } from '/lib/task';
import { hasWebapp } from '/lib/webapp';
import { getToolUrl } from '/lib/xp/admin';
import { get } from '/lib/xp/app';
import { getIdProviders } from '/lib/xp/auth';
import { listComponents, listSchemas } from '/lib/xp/schema';
import type { ContentTypeSchema, PartDescriptor } from '@enonic-types/lib-schema';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  applicationInfoSource,
  deploymentUrlOf,
  idProviderSourceOf,
  listUsedByItems,
  listAdminExtensionItems,
  listAdminToolItems,
  listApiItems,
  listComponentItems,
  listMacroItems,
  listSchemaItems,
  listTaskItems,
  localNameOf,
} from './application-info.source';

function contentType(name: string, title = '', description = ''): ContentTypeSchema {
  return {
    name,
    title,
    titleI18nKey: '',
    description,
    descriptionI18nKey: '',
    createdTime: '2026-07-30T10:00:00Z',
    creator: 'user:system:su',
    modifiedTime: '2026-07-30T10:00:00Z',
    modifier: 'user:system:su',
    resource: '',
    type: 'CONTENT_TYPE',
    form: [],
    config: {},
  };
}

function part(key: string, title = '', description = ''): PartDescriptor {
  return {
    key,
    title,
    titleI18nKey: '',
    description,
    descriptionI18nKey: '',
    componentPath: '',
    modifiedTime: '2026-07-30T10:00:00Z',
    resource: '',
    type: 'PART',
    form: [],
    config: {},
  };
}

function macro(key: string, title = '', description = ''): MacroDescriptor {
  return { key, title, description };
}

function task(key: string, description?: string): TaskDescriptor {
  return { key, description };
}

function adminTool(key: string, title?: string): AdminToolDescriptor {
  return { key, title };
}

function adminExtension(
  key: string,
  title?: string,
  interfaces?: string[],
): AdminExtensionDescriptor {
  return { key, title, interfaces };
}

function api(key: string, title?: string, documentationUrl?: string): ApiDescriptor {
  return { key, title, documentationUrl };
}

// XP's script mapper omits a key entirely when the Java getter returned null, so a descriptor with
// no title reaches JS without a `title` property at all. The declared types do not say so.
function withoutText<T extends { title: string; description: string }>(schema: T): T {
  const { title: _title, description: _description, ...rest } = schema;
  return rest as T;
}

afterEach(() => {
  vi.resetAllMocks();
});

describe('localNameOf', () => {
  it('drops the application prefix', () => {
    expect(localNameOf('com.enonic.app.foo:article')).toBe('article');
  });

  it('returns an unqualified name unchanged', () => {
    expect(localNameOf('article')).toBe('article');
  });

  it('splits on the first colon only, so a name may contain one', () => {
    expect(localNameOf('com.enonic.app.foo:a:b')).toBe('a:b');
  });
});

describe('listSchemaItems', () => {
  it('reports the qualified key alongside the local name', () => {
    vi.mocked(listSchemas).mockReturnValue([contentType('com.example.app:article', 'Article')]);

    expect(listSchemaItems('com.example.app', 'CONTENT_TYPE')).toEqual([
      {
        key: 'com.example.app:article',
        name: 'article',
        displayName: 'Article',
        description: undefined,
      },
    ]);
  });

  it('falls back to the local name when the schema has no title', () => {
    vi.mocked(listSchemas).mockReturnValue([contentType('com.example.app:untitled')]);

    expect(listSchemaItems('com.example.app', 'CONTENT_TYPE')[0]?.displayName).toBe('untitled');
  });

  it('reports an empty description as absent', () => {
    vi.mocked(listSchemas).mockReturnValue([contentType('com.example.app:a', 'A', '')]);

    expect(listSchemaItems('com.example.app', 'CONTENT_TYPE')[0]?.description).toBeUndefined();
  });

  it('survives a schema whose title and description keys were never sent', () => {
    vi.mocked(listSchemas).mockReturnValue([withoutText(contentType('com.example.app:bare'))]);

    expect(listSchemaItems('com.example.app', 'CONTENT_TYPE')).toEqual([
      {
        key: 'com.example.app:bare',
        name: 'bare',
        displayName: 'bare',
        description: undefined,
      },
    ]);
  });

  it('sorts by display name, ignoring case', () => {
    vi.mocked(listSchemas).mockReturnValue([
      contentType('com.example.app:c', 'zeta'),
      contentType('com.example.app:a', 'Alpha'),
      contentType('com.example.app:b', 'Beta'),
    ]);

    expect(
      listSchemaItems('com.example.app', 'CONTENT_TYPE').map((item) => item.displayName),
    ).toEqual(['Alpha', 'Beta', 'zeta']);
  });

  it('reads the schema type it was asked for', () => {
    vi.mocked(listSchemas).mockImplementation(({ type }) =>
      type === 'MIXIN' ? [contentType('com.example.app:meta', 'Meta')] : [],
    );

    expect(listSchemaItems('com.example.app', 'MIXIN').map((item) => item.name)).toEqual(['meta']);
    expect(listSchemaItems('com.example.app', 'CONTENT_TYPE')).toEqual([]);
  });

  it('answers an empty list for an application shipping no schemas', () => {
    vi.mocked(listSchemas).mockReturnValue([]);

    expect(listSchemaItems('com.example.app', 'CONTENT_TYPE')).toEqual([]);
  });
});

describe('listComponentItems', () => {
  it('reads the descriptor key rather than a name field', () => {
    vi.mocked(listComponents).mockReturnValue([part('com.example.app:hero', 'Hero')]);

    expect(listComponentItems('com.example.app', 'PART')).toEqual([
      { key: 'com.example.app:hero', name: 'hero', displayName: 'Hero', description: undefined },
    ]);
  });

  it('survives a descriptor whose title and description keys were never sent', () => {
    vi.mocked(listComponents).mockReturnValue([withoutText(part('com.example.app:bare'))]);

    expect(listComponentItems('com.example.app', 'PART')[0]?.displayName).toBe('bare');
  });

  it('reads the component type it was asked for', () => {
    vi.mocked(listComponents).mockImplementation(({ type }) =>
      type === 'LAYOUT' ? [part('com.example.app:two-column', 'Two column')] : [],
    );

    expect(listComponentItems('com.example.app', 'LAYOUT').map((item) => item.name)).toEqual([
      'two-column',
    ]);
    expect(listComponentItems('com.example.app', 'PART')).toEqual([]);
  });
});

describe('listMacroItems', () => {
  it('splits the qualified macro key into a local name, and reports no description', () => {
    vi.mocked(listMacros).mockReturnValue([macro('com.example.app:quote', 'Quote')]);

    expect(listMacroItems('com.example.app')).toEqual([
      { key: 'com.example.app:quote', name: 'quote', displayName: 'Quote', description: undefined },
    ]);
  });

  // Java's MacroDescriptor substitutes the name for a missing title, so `title` is the one mapped
  // text field that always arrives. It can still arrive empty.
  it('falls back to the local name when the title is empty', () => {
    vi.mocked(listMacros).mockReturnValue([macro('com.example.app:untitled', '')]);

    expect(listMacroItems('com.example.app')[0]?.displayName).toBe('untitled');
  });

  it('sorts by display name, ignoring case', () => {
    vi.mocked(listMacros).mockReturnValue([
      macro('com.example.app:c', 'zeta'),
      macro('com.example.app:a', 'Alpha'),
      macro('com.example.app:b', 'Beta'),
    ]);

    expect(listMacroItems('com.example.app').map((item) => item.displayName)).toEqual([
      'Alpha',
      'Beta',
      'zeta',
    ]);
  });

  it('answers an empty list for an application shipping no macros', () => {
    vi.mocked(listMacros).mockReturnValue([]);

    expect(listMacroItems('com.example.app')).toEqual([]);
  });
});

describe('listTaskItems', () => {
  // The one list whose displayName carries no extra information: TaskDescriptor has no title.
  it('reports the local name as the display name', () => {
    vi.mocked(listTaskDescriptors).mockReturnValue([
      task('com.example.app:reindex', 'Rebuilds the index'),
    ]);

    expect(listTaskItems('com.example.app')).toEqual([
      {
        key: 'com.example.app:reindex',
        name: 'reindex',
        displayName: 'reindex',
        description: 'Rebuilds the index',
      },
    ]);
  });

  it('reports a description the bridge never sent as absent', () => {
    vi.mocked(listTaskDescriptors).mockReturnValue([task('com.example.app:bare')]);

    expect(listTaskItems('com.example.app')[0]?.description).toBeUndefined();
  });

  it('sorts by name, which the pre-rewrite UI left in locator order', () => {
    vi.mocked(listTaskDescriptors).mockReturnValue([
      task('com.example.app:zip'),
      task('com.example.app:Archive'),
      task('com.example.app:build'),
    ]);

    expect(listTaskItems('com.example.app').map((item) => item.name)).toEqual([
      'Archive',
      'build',
      'zip',
    ]);
  });

  it('answers an empty list for an application declaring no tasks', () => {
    vi.mocked(listTaskDescriptors).mockReturnValue([]);

    expect(listTaskItems('com.example.app')).toEqual([]);
  });
});

describe('listAdminToolItems', () => {
  // The url is the one field no bean supplies — lib-admin answers it from the app key and the
  // local name, which is why the mapper does not build it in Java.
  it('builds the tool url from the local name', () => {
    vi.mocked(listAdminTools).mockReturnValue([
      adminTool('com.example.app:dashboard', 'Dashboard'),
    ]);
    vi.mocked(getToolUrl).mockImplementation(
      (application, tool) => `/admin/${application}/${tool}`,
    );

    expect(listAdminToolItems('com.example.app')).toEqual([
      {
        key: 'com.example.app:dashboard',
        name: 'dashboard',
        displayName: 'Dashboard',
        description: undefined,
        url: '/admin/com.example.app/dashboard',
      },
    ]);
  });

  it('answers an empty list for an application contributing no tools', () => {
    vi.mocked(listAdminTools).mockReturnValue([]);

    expect(listAdminToolItems('com.example.app')).toEqual([]);
  });
});

describe('listAdminExtensionItems', () => {
  it('carries the interfaces the extension plugs into', () => {
    vi.mocked(listAdminExtensions).mockReturnValue([
      adminExtension('com.example.app:stats', 'Stats', ['contentBrowsePanel']),
    ]);

    expect(listAdminExtensionItems('com.example.app')).toEqual([
      {
        key: 'com.example.app:stats',
        name: 'stats',
        displayName: 'Stats',
        description: undefined,
        interfaces: ['contentBrowsePanel'],
      },
    ]);
  });

  // The schema promises a non-null list, and the bridge drops an empty array rather than sending
  // one — without the fallback the field would break the contract it declares.
  it('reports no interfaces as an empty list, never absent', () => {
    vi.mocked(listAdminExtensions).mockReturnValue([adminExtension('com.example.app:bare')]);

    expect(listAdminExtensionItems('com.example.app')[0]?.interfaces).toEqual([]);
  });

  it('sorts by display name, ignoring case', () => {
    vi.mocked(listAdminExtensions).mockReturnValue([
      adminExtension('com.example.app:z', 'zeta'),
      adminExtension('com.example.app:a', 'Alpha'),
    ]);

    expect(listAdminExtensionItems('com.example.app').map((item) => item.displayName)).toEqual([
      'Alpha',
      'zeta',
    ]);
  });
});

describe('listApiItems', () => {
  it('carries the documentation url when the descriptor declares one', () => {
    vi.mocked(listApis).mockReturnValue([
      api('com.example.app:graphql', 'GraphQL', 'https://example.com/docs'),
    ]);

    expect(listApiItems('com.example.app')).toEqual([
      {
        key: 'com.example.app:graphql',
        name: 'graphql',
        displayName: 'GraphQL',
        description: undefined,
        documentationUrl: 'https://example.com/docs',
      },
    ]);
  });

  it('reports an absent documentation url as undefined', () => {
    vi.mocked(listApis).mockReturnValue([api('com.example.app:graphql', 'GraphQL')]);

    expect(listApiItems('com.example.app')[0]?.documentationUrl).toBeUndefined();
  });
});

describe('deploymentUrlOf', () => {
  it('mounts the webapp under its application key', () => {
    vi.mocked(hasWebapp).mockReturnValue(true);

    expect(deploymentUrlOf('com.example.app')).toBe('/webapp/com.example.app');
  });

  // Null is what tells the panel to leave the Web App section out; an empty string would render it.
  it('answers null for an application shipping no webapp', () => {
    vi.mocked(hasWebapp).mockReturnValue(false);

    expect(deploymentUrlOf('com.example.app')).toBeNull();
  });
});

describe('idProviderSourceOf', () => {
  // The null-versus-object distinction is the whole point: null hides the section, an object with no
  // mode still shows it. The pre-rewrite IdProviderApplicationJson collapsed both into one string
  // field and NPEd on the second.
  it('answers null for an application that ships no descriptor', () => {
    vi.mocked(getIdProviderDescriptor).mockReturnValue(null);

    expect(idProviderSourceOf('com.example.app')).toBeNull();
  });

  it('carries the mode the descriptor declares', () => {
    vi.mocked(getIdProviderDescriptor).mockReturnValue({ mode: 'MIXED', hasConfig: false });

    expect(idProviderSourceOf('com.example.app')).toEqual({
      application: 'com.example.app',
      mode: 'MIXED',
      hasConfig: false,
    });
  });

  it('is still an id provider when the descriptor omits the mode', () => {
    vi.mocked(getIdProviderDescriptor).mockReturnValue({ hasConfig: false });

    expect(idProviderSourceOf('com.example.app')).toEqual({
      application: 'com.example.app',
      hasConfig: false,
      mode: undefined,
    });
  });
});

describe('listUsedByItems', () => {
  it('keeps only the providers bound to this application', () => {
    vi.mocked(getIdProviders).mockReturnValue([
      { key: 'oidc', displayName: 'OIDC', idProviderConfig: { applicationKey: 'com.example.app' } },
      { key: 'other', displayName: 'Other', idProviderConfig: { applicationKey: 'com.other.app' } },
    ]);

    expect(listUsedByItems('com.example.app')).toEqual([{ key: 'oidc', displayName: 'OIDC' }]);
  });

  // An unbound provider has no idProviderConfig at all — reading through it must not throw.
  it('skips a provider bound to no application', () => {
    vi.mocked(getIdProviders).mockReturnValue([{ key: 'orphan', displayName: 'Orphan' }]);

    expect(listUsedByItems('com.example.app')).toEqual([]);
  });

  // What the details panel shows for a freshly installed id provider app: the section, but no row.
  it('answers an empty list when nothing is bound yet', () => {
    vi.mocked(getIdProviders).mockReturnValue([]);

    expect(listUsedByItems('com.example.app')).toEqual([]);
  });

  it('sorts by display name, ignoring case', () => {
    vi.mocked(getIdProviders).mockReturnValue([
      { key: 'z', displayName: 'zeta', idProviderConfig: { applicationKey: 'com.example.app' } },
      { key: 'a', displayName: 'Alpha', idProviderConfig: { applicationKey: 'com.example.app' } },
    ]);

    expect(listUsedByItems('com.example.app').map((item) => item.displayName)).toEqual([
      'Alpha',
      'zeta',
    ]);
  });
});

describe('applicationInfoSource', () => {
  it('carries only the key, so each leaf resolves its own call', () => {
    vi.mocked(get).mockReturnValue({
      key: 'com.example.app',
      version: '1.0.0',
      systemVersion: '8.1.0',
      minSystemVersion: null,
      maxSystemVersion: null,
      modifiedTime: null,
      started: true,
      system: false,
    });

    expect(applicationInfoSource('com.example.app')).toEqual({ key: 'com.example.app' });
  });

  // Without this an unknown key answers with empty lists, indistinguishable from an installed
  // application that ships no CMS content.
  it('answers null for an application that is not installed', () => {
    vi.mocked(get).mockReturnValue(null);

    expect(applicationInfoSource('com.example.missing')).toBeNull();
  });
});
