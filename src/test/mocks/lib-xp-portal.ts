import type { ApiUrlParams } from '@enonic-types/lib-portal';
import { vi } from 'vitest';

export const apiUrl = vi.fn<(params: ApiUrlParams) => string>();
