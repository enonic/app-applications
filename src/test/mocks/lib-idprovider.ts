import { vi } from 'vitest';

// ? Shape restated rather than imported from src/main/resources/lib/idprovider.ts — that module reads
// ? the `__` bridge, which only the server tsconfig declares.
type IdProviderDescriptor = {
  mode?: string;
  hasConfig: boolean;
};

export const getIdProviderDescriptor =
  vi.fn<(params: { application: string }) => IdProviderDescriptor | null>();
