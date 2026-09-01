import { getHost } from '../host';
import { itemPath, LIST_PATH } from './routing';

/**
 * ! Both replace rather than push. The active row moves with the arrow keys too, so every step a user
 * ! holds a key through would otherwise land in the shell's history and have to be walked back out.
 */
export function openItem(key: string): void {
  getHost()?.navigate(itemPath(key), { replace: true });
}

export function closeItem(): void {
  getHost()?.navigate(LIST_PATH, { replace: true });
}
