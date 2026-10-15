import type { Application, ApplicationDescriptor } from '@enonic-types/lib-app';
import { vi } from 'vitest';

export const list = vi.fn<() => Application[]>();

export const get = vi.fn<(params: { key: string }) => Application | null>();

export const getDescriptor = vi.fn<(params: { key: string }) => ApplicationDescriptor | null>();

export const getApplicationMode = vi.fn<(params: { key: string }) => string | null>();
