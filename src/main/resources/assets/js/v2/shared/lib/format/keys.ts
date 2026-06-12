import {expandLigatures} from './ligatures';

// Combining diacritics range that NFD decomposes accented characters into.
const DIACRITICS_RE = /[̀-ͯ]/g;

/**
 * Normalizes text for use as keys (e.g., localStorage keys, identifiers).
 *
 * Transformation rules:
 * - Converts to lowercase
 * - Expands ligatures (æ→ae, ß→ss, etc.)
 * - Replaces whitespace, hyphens, dots, slashes with underscores
 * - Removes all non-alphanumeric characters except underscores
 * - Collapses multiple underscores into one
 * - Trims leading/trailing underscores
 * - Returns empty string if result is empty
 *
 * @example
 * normalize("My Project Name")     // "my_project_name"
 * normalize("foo.bar/baz")         // "foo_bar_baz"
 * normalize("test--key")           // "test_key"
 * normalize("Hello@World!")        // "helloworld"
 *
 * @param text - The text to normalize
 * @returns Normalized string suitable for use as a key
 */
export function normalize(text: string): string {
    if (!text || typeof text !== 'string') {
        return '';
    }

    return expandLigatures(text.toLowerCase())
        .normalize('NFD')
        .replace(DIACRITICS_RE, '')
        .replace(/[\s\-./\\:]+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
}

export function buildKey(...args: string[]): string {
    return args.map(normalize).join('-');
}
