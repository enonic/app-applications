import { vi } from 'vitest';

export const isLocalApplication = vi.fn<(params: { application: string }) => boolean>();
