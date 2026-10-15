import { vi } from 'vitest';

export const encodeApplicationIcon = vi.fn<(params: { application: string }) => string | null>();
