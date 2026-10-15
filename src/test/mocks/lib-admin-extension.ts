import { vi } from 'vitest';

// ? Shape restated rather than imported from src/main/resources/lib/admin-extension.ts — that module
// ? reads the `__` bridge, which only the server tsconfig declares.
type AdminExtensionDescriptor = {
  key: string;
  title?: string;
  titleI18nKey?: string;
  description?: string;
  descriptionI18nKey?: string;
  interfaces?: string[];
};

export const listAdminExtensions =
  vi.fn<(params: { application: string }) => AdminExtensionDescriptor[]>();
