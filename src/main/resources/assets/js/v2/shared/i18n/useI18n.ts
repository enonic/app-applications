import {Messages} from '@enonic/lib-admin-ui/util/Messages';

/**
 * Reads an i18n message by key. Returns `#key#` when the key is missing —
 * deliberately loud so missing keys surface in QA rather than silently
 * rendering an empty string.
 *
 * Plain function — safe to call from event handlers and non-React modules.
 */
export function i18n(key: string, ...args: (string | number)[]): string {
    const phrase = Messages.hasMessage(key) ? Messages.getMessage(key) : `#${key}#`;
    return phrase.replace(/{(\d+)}/g, (_substring: string, ...replaceArgs: number[]) => String(args[replaceArgs[0]])).trim();
}

/** React-friendly alias for `i18n`. Keep this in components for symmetry with the rest of the hook layer. */
export const useI18n = i18n;
