import type { ApplicationItem } from '../../../entities/application';

/** How every details list orders what it shows: locale-aware, blind to case. */
export function compareText(a: string, b: string): number {
  return a.localeCompare(b, undefined, { sensitivity: 'base' });
}

// The server sorts each list by display name, and the details sections render `name` — a descriptor
// that carries a title would otherwise sit out of order on screen.
export function byName(items: readonly ApplicationItem[]): ApplicationItem[] {
  return [...items].sort((a, b) => compareText(a.name, b.name));
}
