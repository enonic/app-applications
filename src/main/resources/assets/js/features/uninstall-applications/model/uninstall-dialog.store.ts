import type { Application } from '../../../entities/application';
import { createDialogStore } from '../../../shared/dialog';

const store = createDialogStore<readonly Application[]>();

/** The applications the confirmation is asking about, or nothing while it is closed. */
export const $uninstallTargets = store.$payload;

export function openUninstallDialog(applications: readonly Application[]): void {
  if (applications.length === 0) {
    return;
  }

  store.open(applications);
}

export function closeUninstallDialog(): void {
  store.close();
}
