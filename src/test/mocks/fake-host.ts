import { vi } from 'vitest';

import type {
  Notification,
  Readable,
  SectionHost,
} from '../../main/resources/assets/js/shared/sections';

/**
 * ! Never calls back on subscribe, as the contract says and a nanostores atom does not: an atom here
 * ! would hide every bug that reading `get()` before subscribing is what prevents.
 */
export function readable<T>(initial: T): Readable<T> & { set(value: T): void } {
  let current = initial;
  const listeners = new Set<(v: T) => void>();

  return {
    get: () => current,
    set(value: T) {
      current = value;
      for (const listener of listeners) {
        listener(value);
      }
    },
    subscribe(callback: (v: T) => void) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
  };
}

export const pathStore = (initial: string): ReturnType<typeof readable<string>> =>
  readable(initial);

/**
 * A stand-in for the object the shell hands to `mount`. Only what a test drives is real; the rest
 * answers plausibly so nothing has to be stubbed twice.
 */
export function fakeHost(overrides: Partial<SectionHost> = {}): SectionHost {
  return {
    baseUrl: '/admin/tool/_/admin:extension/com.enonic.xp.app.applications:applications',
    locale: 'en',
    theme: readable<'light' | 'dark'>('light'),
    visible: readable(true),
    path: pathStore('/'),
    navigate: vi.fn(),
    notify: vi.fn((_notification: Notification) => () => undefined),
    ...overrides,
  };
}
