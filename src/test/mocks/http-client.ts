import { vi } from 'vitest';

import type { HttpRequestParams, HttpResponse } from '../../main/resources/types/http-client';

export const request = vi.fn<(params: HttpRequestParams) => HttpResponse>();
