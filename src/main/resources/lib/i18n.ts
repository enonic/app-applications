import { getPhrases } from '/lib/xp/i18n';

export const BUNDLES = ['i18n/phrases'];

export const DEFAULT_LOCALE = 'en';

export function resolveLocales(locales: string[] | undefined): string[] {
  return locales !== undefined && locales.length > 0 ? locales : [DEFAULT_LOCALE];
}

export function getAllPhrases(
  locales: string[],
  bundles: string[] = BUNDLES,
): Record<string, string> {
  const phrases: Record<string, string> = {};

  bundles.forEach((bundle) => {
    const bundlePhrases = getPhrases(locales, [bundle]);
    Object.keys(bundlePhrases).forEach((key) => {
      phrases[key] = bundlePhrases[key];
    });
  });

  return phrases;
}
