import { getPhrases } from '/lib/xp/i18n';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { phrasesQueryFields } from './phrases.fields';

const resolve = (locale?: string) =>
  phrasesQueryFields.phrases.resolve?.({ args: { locale } } as never);

beforeEach(() => {
  vi.mocked(getPhrases).mockReturnValue({ 'applications.heading': 'Applications' });
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('phrases', () => {
  it('asks for the locale the shell resolved', () => {
    expect(resolve('no')).toEqual({ 'applications.heading': 'Applications' });
    expect(vi.mocked(getPhrases).mock.calls[0]?.[0]).toEqual(['no']);
  });

  it('falls back to the default locale when the caller names none', () => {
    resolve();

    expect(vi.mocked(getPhrases).mock.calls[0]?.[0]).toEqual(['en']);
  });
});
