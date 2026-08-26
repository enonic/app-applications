import { encodeApplicationIcon } from '/lib/icon';
import {
  get,
  getDescriptor,
  list,
  type Application,
  type ApplicationDescriptor,
} from '/lib/xp/app';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  displayNameOf,
  getApplication,
  iconDataUriOf,
  listApplications,
  type ApplicationSource,
} from './application.source';

function application(key: string, overrides: Partial<Application> = {}): Application {
  return {
    key,
    version: '1.0.0',
    systemVersion: '8.1.0',
    minSystemVersion: null,
    maxSystemVersion: null,
    modifiedTime: '2026-07-30T10:00:00Z',
    started: true,
    system: false,
    ...overrides,
  };
}

function descriptor(key: string, title: string | null): ApplicationDescriptor {
  return {
    key,
    description: `${key} description`,
    descriptionI18nKey: null,
    title,
    titleI18nKey: null,
    vendorName: 'Enonic AS',
    vendorUrl: 'https://enonic.com',
    url: null,
  };
}

function source(key: string, title: string | null): ApplicationSource {
  return { ...application(key), descriptor: title === null ? null : descriptor(key, title) };
}

afterEach(() => {
  vi.resetAllMocks();
});

describe('iconDataUriOf', () => {
  const withIcon: ApplicationSource = {
    ...application('com.example.booster'),
    descriptor: {
      ...descriptor('com.example.booster', 'Booster'),
      icon: { data: {} as never, mimeType: 'image/svg+xml', modifiedTime: '2026-07-30T10:00:00Z' },
    },
  };

  it('composes the descriptor mime type with the bytes the bean encoded', () => {
    vi.mocked(encodeApplicationIcon).mockReturnValue('PHN2Zy8+');

    expect(iconDataUriOf(withIcon)).toBe('data:image/svg+xml;base64,PHN2Zy8+');
    expect(vi.mocked(encodeApplicationIcon)).toHaveBeenCalledWith({
      application: 'com.example.booster',
    });
  });

  it('reads nothing for an application that ships no icon', () => {
    expect(iconDataUriOf(source('com.example.plain', 'Plain'))).toBeUndefined();
    expect(vi.mocked(encodeApplicationIcon)).not.toHaveBeenCalled();
  });

  it('reads nothing when the application has no descriptor at all', () => {
    expect(iconDataUriOf(source('com.example.bare', null))).toBeUndefined();
  });

  it('survives a descriptor whose icon the bean could not read', () => {
    vi.mocked(encodeApplicationIcon).mockReturnValue(null);

    expect(iconDataUriOf(withIcon)).toBeUndefined();
  });
});

describe('displayNameOf', () => {
  it('reports the descriptor title', () => {
    expect(displayNameOf(source('com.example.booster', 'Booster'))).toBe('Booster');
  });

  it('falls back to the key when the app ships no descriptor', () => {
    expect(displayNameOf(source('com.example.nodesc', null))).toBe('com.example.nodesc');
  });

  it('falls back to the key when the descriptor title is empty', () => {
    const withEmptyTitle = { ...source('com.example.blank', ''), descriptor: descriptor('x', '') };

    expect(displayNameOf(withEmptyTitle)).toBe('com.example.blank');
  });
});

describe('getApplication', () => {
  it('attaches the descriptor to the application', () => {
    vi.mocked(get).mockReturnValue(application('com.example.a'));
    vi.mocked(getDescriptor).mockReturnValue(descriptor('com.example.a', 'Alpha'));

    const found = getApplication('com.example.a');

    expect(found?.key).toBe('com.example.a');
    expect(found?.descriptor?.title).toBe('Alpha');
  });

  it('keeps a null descriptor rather than dropping the application', () => {
    vi.mocked(get).mockReturnValue(application('com.example.bare'));
    vi.mocked(getDescriptor).mockReturnValue(null);

    expect(getApplication('com.example.bare')?.descriptor).toBeNull();
  });

  it('reports null when no such application is installed', () => {
    vi.mocked(get).mockReturnValue(null);

    expect(getApplication('com.example.gone')).toBeNull();
    expect(vi.mocked(getDescriptor)).not.toHaveBeenCalled();
  });
});

describe('listApplications', () => {
  it('attaches the descriptor of each application', () => {
    vi.mocked(list).mockReturnValue([application('com.example.a')]);
    vi.mocked(getDescriptor).mockReturnValue(descriptor('com.example.a', 'Alpha'));

    const [first] = listApplications();

    expect(first?.key).toBe('com.example.a');
    expect(first?.descriptor?.title).toBe('Alpha');
  });

  it('keeps a null descriptor rather than dropping the application', () => {
    vi.mocked(list).mockReturnValue([application('com.example.bare')]);
    vi.mocked(getDescriptor).mockReturnValue(null);

    const applications = listApplications();

    expect(applications).toHaveLength(1);
    expect(applications[0]?.descriptor).toBeNull();
  });

  it('sorts by display name, ignoring case', () => {
    vi.mocked(list).mockReturnValue([
      application('com.example.c'),
      application('com.example.a'),
      application('com.example.b'),
    ]);
    vi.mocked(getDescriptor).mockImplementation(({ key }) => {
      const titles: Record<string, string> = {
        'com.example.a': 'zeta',
        'com.example.b': 'Alpha',
        'com.example.c': 'Beta',
      };
      return descriptor(key, titles[key] ?? null);
    });

    expect(listApplications().map(displayNameOf)).toEqual(['Alpha', 'Beta', 'zeta']);
  });

  it('sorts an app without a descriptor by its key', () => {
    vi.mocked(list).mockReturnValue([application('zzz.app'), application('aaa.app')]);
    vi.mocked(getDescriptor).mockReturnValue(null);

    expect(listApplications().map((source) => source.key)).toEqual(['aaa.app', 'zzz.app']);
  });

  it('resolves the descriptor once per application', () => {
    vi.mocked(list).mockReturnValue([application('com.example.a'), application('com.example.b')]);
    vi.mocked(getDescriptor).mockReturnValue(null);

    listApplications();

    expect(vi.mocked(getDescriptor)).toHaveBeenCalledTimes(2);
  });
});
