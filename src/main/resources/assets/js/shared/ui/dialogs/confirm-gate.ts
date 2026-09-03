export function matchesExpected(typed: string, expected: string | number): boolean {
  return typed.trim() === String(expected);
}
