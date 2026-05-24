import {describe, expect, it} from 'vitest';
import {compareVersionNumbers} from './compareVersionNumbers';

describe('entities/market/lib/compareVersionNumbers', () => {
    it('returns positive when a is greater', () => {
        expect(compareVersionNumbers('1.2.0', '1.1.0')).toBeGreaterThan(0);
        expect(compareVersionNumbers('2.0.0', '1.99.99')).toBeGreaterThan(0);
    });

    it('returns negative when a is smaller', () => {
        expect(compareVersionNumbers('1.0.0', '1.0.1')).toBeLessThan(0);
    });

    it('returns 0 for equal versions', () => {
        expect(compareVersionNumbers('1.2.3', '1.2.3')).toBe(0);
    });

    it('treats longer as greater when prefix matches', () => {
        expect(compareVersionNumbers('1.0.0', '1.0')).toBeGreaterThan(0);
        expect(compareVersionNumbers('1.0', '1.0.0')).toBeLessThan(0);
    });
});
