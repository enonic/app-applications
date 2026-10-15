import { vi } from 'vitest';

export const hasWebapp = vi.fn<(params: { application: string }) => boolean>();
