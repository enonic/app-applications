import { atom } from 'nanostores';

export type Phrases = Readonly<Record<string, string>>;

export type PhraseValue = string | number;

export const $phrases = atom<Phrases>({});

export const $locale = atom<string>('en');

export function setPhrases(phrases: Phrases, locale: string): void {
  $phrases.set(phrases);
  $locale.set(locale);
}

export function localize(phrases: Phrases, key: string, ...values: PhraseValue[]): string {
  const phrase = phrases[key];
  if (phrase === undefined) {
    return `#${key}#`;
  }

  return phrase.replace(/\{(\d+)\}/g, (placeholder, index: string) => {
    const value = values[Number(index)];
    return value === undefined ? placeholder : String(value);
  });
}
