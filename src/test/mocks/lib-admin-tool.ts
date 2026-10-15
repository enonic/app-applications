import { vi } from 'vitest';

// ? Shape restated rather than imported from src/main/resources/lib/admin-tool.ts — that module
// ? reads the `__` bridge, which only the server tsconfig declares.
type AdminToolDescriptor = {
  key: string;
  title?: string;
  titleI18nKey?: string;
  description?: string;
  descriptionI18nKey?: string;
};

export const listAdminTools = vi.fn<(params: { application: string }) => AdminToolDescriptor[]>();
