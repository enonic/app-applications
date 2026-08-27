import { vi } from 'vitest';

// ? Shape restated rather than imported from src/main/resources/lib/api.ts — that module reads the
// ? `__` bridge, which only the server tsconfig declares.
type ApiDescriptor = {
  key: string;
  title?: string;
  titleI18nKey?: string;
  description?: string;
  descriptionI18nKey?: string;
  documentationUrl?: string;
};

export const listApis = vi.fn<(params: { application: string }) => ApiDescriptor[]>();
