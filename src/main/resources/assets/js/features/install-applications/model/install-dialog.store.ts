import { computed } from 'nanostores';

import { createDialogStore } from '../../../shared/dialog';

const store = createDialogStore<true>();

export const $installDialogOpen = computed(store.$payload, (payload) => payload === true);

export function openInstallDialog(): void {
  store.open(true);
}

export function closeInstallDialog(): void {
  store.close();
}
