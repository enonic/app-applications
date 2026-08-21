import { getPhrases } from '/lib/xp/i18n';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { sectionQueryFields } from './section.fields';

const resolveConfig = () => sectionQueryFields.config.resolve?.({} as never);
const resolvePhrases = (locale?: string) =>
  sectionQueryFields.phrases.resolve?.({ args: { locale } } as never);

beforeEach(() => {
  vi.stubGlobal('app', { name: 'com.enonic.xp.app.applications', version: '8.1.0' });
  vi.mocked(getPhrases).mockReturnValue({ 'section.title': 'Applications' });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});

describe('config', () => {
  it("answers this application's own key and version, not the shell's", () => {
    expect(resolveConfig()).toEqual({
      appId: 'com.enonic.xp.app.applications',
      appVersion: '8.1.0',
    });
  });
});

describe('phrases', () => {
  it('asks for the locale the shell resolved', () => {
    expect(resolvePhrases('no')).toEqual({ 'section.title': 'Applications' });
    expect(vi.mocked(getPhrases).mock.calls[0]?.[0]).toEqual(['no']);
  });

  it('falls back to the default locale when the caller names none', () => {
    resolvePhrases();

    expect(vi.mocked(getPhrases).mock.calls[0]?.[0]).toEqual(['en']);
  });
});
