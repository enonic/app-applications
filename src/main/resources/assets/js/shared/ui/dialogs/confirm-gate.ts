/** Whether the entry is what was asked for, compared as text: `03` and `3.0` are not `3`. */
export function matchesExpected(typed: string, expected: string | number): boolean {
  return typed.trim() === String(expected);
}
