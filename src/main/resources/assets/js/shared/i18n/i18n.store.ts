import type { Phrases } from '@enonic/ui-utils';
import { atom } from 'nanostores';

export const $phrases = atom<Phrases>({});

export const $locale = atom<string>('en');

export function setPhrases(phrases: Phrases, locale: string): void {
  $phrases.set(phrases);
  $locale.set(locale);
}
