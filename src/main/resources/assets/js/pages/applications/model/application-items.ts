import type { ApplicationItem } from '../../../entities/application';

// The server sorts each list by display name, and the details sections render `name` — a descriptor
// that carries a title would otherwise sit out of order on screen.
export function byName(items: readonly ApplicationItem[]): ApplicationItem[] {
  return [...items].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  );
}
