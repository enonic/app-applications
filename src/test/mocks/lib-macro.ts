import { vi } from 'vitest';

// ? The shape is restated rather than imported from src/main/resources/lib/macro.ts: that module
// ? reads the `__` bridge, which only the server tsconfig declares, so pulling it into this
// ? (client) program would not type-check. Test files import the real type from `/lib/macro`.
type MacroDescriptor = {
  key: string;
  title: string;
  titleI18nKey?: string;
  description?: string;
  descriptionI18nKey?: string;
};

export const listMacros = vi.fn<(params: { application: string }) => MacroDescriptor[]>();
