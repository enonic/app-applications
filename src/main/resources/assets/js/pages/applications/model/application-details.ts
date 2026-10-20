const LOWER_SIGN = { '[': '≥', '(': '>' } as const;
const UPPER_SIGN = { ']': '≤', ')': '<' } as const;

const RANGE = /^([[(])\s*([^,\s]+)\s*,\s*([^\s\])]+)\s*([\])])$/;

/**
 * The platform versions an application accepts, one comparison sign per bound: `[8.1.0,9.0.0)`
 * reads `≥ 8.1.0, < 9.0.0`, and a bare `8.1.0` — how XP writes a range with no upper bound — reads
 * `≥ 8.1.0`. `undefined` where the descriptor names no range, so the field is left out rather than
 * rendered empty. A range the regex does not recognise is shown as XP reported it rather than hidden.
 */
export function systemVersionRequirement(range?: string): string | undefined {
  if (range == null || range.length === 0) {
    return undefined;
  }

  if (!range.includes(',')) {
    return `${LOWER_SIGN['[']} ${range}`;
  }

  const match = RANGE.exec(range);
  if (match == null) {
    return range;
  }

  const [, open, lower, upper, close] = match;
  const lowerSign = LOWER_SIGN[open as keyof typeof LOWER_SIGN];
  const upperSign = UPPER_SIGN[close as keyof typeof UPPER_SIGN];

  return `${lowerSign} ${lower}, ${upperSign} ${upper}`;
}
