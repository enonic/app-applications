import {describe, expect, it} from 'vitest';
import {formatDateTime} from './formatDate';

describe('formatDateTime', () => {
    it('returns "" for empty input', () => {
        expect(formatDateTime('')).toBe('');
        expect(formatDateTime(undefined)).toBe('');
    });

    it('returns "" for an unparsable timestamp', () => {
        expect(formatDateTime('not a date')).toBe('');
    });

    it('formats the timestamp as yyyy-MM-dd HH:mm:ss using the local timezone', () => {
        const iso = '2025-03-04T05:06:07Z';
        const local = new Date(iso);
        const expected =
            `${String(local.getFullYear()).padStart(4, '0')}-` +
            `${String(local.getMonth() + 1).padStart(2, '0')}-` +
            `${String(local.getDate()).padStart(2, '0')} ` +
            `${String(local.getHours()).padStart(2, '0')}:` +
            `${String(local.getMinutes()).padStart(2, '0')}:` +
            `${String(local.getSeconds()).padStart(2, '0')}`;
        expect(formatDateTime(iso)).toBe(expected);
    });
});
