import {Messages} from '@enonic/lib-admin-ui/util/Messages';

/**
 * Reads an i18n message by key. Returns `#key#` when the key is missing —
 * deliberately loud so missing keys surface in QA rather than silently
 * rendering an empty string.
 */
export function useI18n(key: string, ...args: (string | number)[]): string {
    const phrase = Messages.hasMessage(key) ? Messages.getMessage(key) : `#${key}#`;
    return phrase.replace(/{(\d+)}/g, (_substring: string, ...replaceArgs: number[]) => String(args[replaceArgs[0]])).trim();
}
