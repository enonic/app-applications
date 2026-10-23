const LOWER_SIGN = { '[': '≥', '(': '>' } as const;

const BARE = /^[^\s,[\]()]+$/;
const RANGE = /^([[(])\s*([^,\s]+)\s*,\s*[^\s\])]+\s*[\])]$/;

/**
 * The lowest platform version an application accepts: `[8.1.0,9.0.0)` and a bare `8.1.0` both read
 * `≥ 8.1.0`. The upper bound is dropped on purpose — it is always the next major and tells the user
 * nothing. `undefined` where the descriptor names no range, so the field is left out; a range the
 * regex does not recognise is shown as XP reported it rather than hidden.
 */
export function systemVersionRequirement(range?: string): string | undefined {
  if (range == null || range.length === 0) {
    return undefined;
  }

  if (BARE.test(range)) {
    return `${LOWER_SIGN['[']} ${range}`;
  }

  const match = RANGE.exec(range);
  if (match == null) {
    return range;
  }

  const [, open, lower] = match;
  const lowerSign = LOWER_SIGN[open as keyof typeof LOWER_SIGN];

  return `${lowerSign} ${lower}`;
}
