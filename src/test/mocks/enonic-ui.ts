// Not an XP lib, and the same problem lucide-react has: the published bundle is externalized CJS
// that requires `react`, which bypasses the react → preact/compat alias and is not installed. Nothing
// renders in the node tests, so the imports only have to resolve — a component reached through an
// entity barrel is enough to pull this in. Add an export here when one starts using another part of
// the library.
export function cn(...classes: unknown[]): string {
  return classes.filter((entry) => typeof entry === 'string').join(' ');
}

export function Tooltip(): null {
  return null;
}
