/**
 * Compares two dotted-numeric version strings.
 *
 * Ported verbatim from the legacy `MarketAppsTreeGridHelper.compareVersionNumbers`:
 * shorter inputs lose ties (`1.0` < `1.0.0`), non-numeric segments coerce via
 * `parseInt` (so `1.0.beta` reads as `1.0.NaN`, matching prior behaviour).
 * Returns `> 0` when `a > b`, `< 0` when `a < b`, `0` when equal.
 */
export function compareVersionNumbers(a: string, b: string): number {
    const aParts = a.split('.').map((el) => parseInt(el, 10));
    const bParts = b.split('.').map((el) => parseInt(el, 10));

    for (let i = 0; i < aParts.length; i++) {
        if (bParts.length === i) return 1;
        if (aParts[i] === bParts[i]) continue;
        if (aParts[i] > bParts[i]) return 1;
        return -1;
    }

    if (aParts.length !== bParts.length) return -1;
    return 0;
}
