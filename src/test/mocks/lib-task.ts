import { vi } from 'vitest';

// ? The shape is restated rather than imported from src/main/resources/lib/task.ts: that module
// ? reads the `__` bridge, which only the server tsconfig declares, so pulling it into this
// ? (client) program would not type-check. Test files import the real type from `/lib/task`.
type TaskDescriptor = {
  key: string;
  description?: string;
  descriptionI18nKey?: string;
};

export const listTaskDescriptors = vi.fn<(params: { application: string }) => TaskDescriptor[]>();
