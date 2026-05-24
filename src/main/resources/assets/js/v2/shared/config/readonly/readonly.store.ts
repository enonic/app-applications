import {atom, computed} from 'nanostores';

/** Global read-only mode (disables write actions across the UI). */
export const $readonly = atom<boolean>(false);

export const $isReadonly = computed($readonly, (v) => v);
