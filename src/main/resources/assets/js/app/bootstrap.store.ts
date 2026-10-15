import { map } from 'nanostores';

export type BootstrapState = {
  status: 'loading' | 'ready' | 'error';
  error?: string;
};

export const $bootstrap = map<BootstrapState>({ status: 'loading' });

export function bootstrapReady(): void {
  $bootstrap.set({ status: 'ready' });
}

export function bootstrapFailed(error: string): void {
  $bootstrap.set({ status: 'error', error });
}
