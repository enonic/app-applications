import type { IdProvider } from '@enonic-types/lib-auth';
import { vi } from 'vitest';

// Only the one call `applicationInfo.idProvider.usedBy` makes. The rest of lib-auth is principal
// CRUD, which belongs to app-settings — a double for it here would be surface nothing reads.
export const getIdProviders = vi.fn<() => IdProvider[]>();
