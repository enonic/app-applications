import { $phrases, localize, type PhraseValue } from './i18n.store';

/**
 * The phrase behind a key, with `{0}`-style placeholders filled in.
 *
 * ! A plain function rather than a hook, and that is only safe because the phrases arrive once:
 * ! `main.ts` calls `setPhrases` from the tool config before the first render, and nothing sets them
 * ! again. A component therefore never has to re-render because a phrase changed. Add a runtime locale
 * ! switch and this has to become a store read again — a hook, or a signal the shell re-renders on.
 *
 * ! Resolve at call time, never at module scope: a `const LABEL = i18n('x')` at the top of a file runs
 * ! while the module is imported, which happens before `setPhrases`, and would freeze `#x#` forever.
 * ! Files hold their phrase *keys* at the top and resolve where they render.
 */
export function i18n(key: string, ...values: PhraseValue[]): string {
  return localize($phrases.get(), key, ...values);
}
