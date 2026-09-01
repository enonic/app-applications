import { $phrases, localize, type PhraseValue } from './i18n.store';

/**
 * The phrase behind a key, with `{0}`-style placeholders filled in. ! A plain function, safe only because
 * the phrases arrive once at bootstrap and never change; a runtime locale switch would make this a store
 * read. ! Resolve at call time — at module scope it runs before the phrases and freezes `#key#` forever.
 */
export function i18n(key: string, ...values: PhraseValue[]): string {
  return localize($phrases.get(), key, ...values);
}
