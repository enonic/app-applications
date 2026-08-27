import type { ExtensionUrlParams } from '@enonic-types/lib-admin';
import { vi } from 'vitest';

export const extensionUrl = vi.fn<(params: ExtensionUrlParams) => string>();

export const getToolUrl = vi.fn<(application: string, tool: string) => string>();

export const getVersion = vi.fn<() => string>();
