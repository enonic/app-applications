import { vi } from 'vitest';

let contents: Record<string, string> = {};

/** What the jar is pretended to hold; anything else answers `exists() === false`. */
export function setResources(entries: Record<string, string>): void {
  contents = entries;
}

export const getResource = vi.fn((key: string) => ({
  exists: () => key in contents,
  getStream: () => key as unknown as never,
}));

export const readText = vi.fn((stream: unknown) => contents[String(stream)] ?? '');

export const getMimeType = vi.fn((_name: string) => 'application/octet-stream');
