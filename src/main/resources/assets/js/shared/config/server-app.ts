import { $config } from './config.store';

export function serverAppUrl(path?: string): string | undefined {
  const base = $config.get()?.serverAppUrl;

  if (base == null) {
    return undefined;
  }

  return path == null ? base : `${base}/${path}`;
}
