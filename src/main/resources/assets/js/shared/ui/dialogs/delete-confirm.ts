import type { ReactNode } from 'react';

export type DeleteTarget = {
  key: string;
  /** What has to be typed back to delete this one. */
  name: string;
  /** How the item reads elsewhere in the app: the caller renders it, so the dialog knows no domain. */
  label: ReactNode;
};

export function deleteExpectation(targets: readonly DeleteTarget[]): string | number {
  const [only] = targets;

  return targets.length === 1 && only !== undefined ? only.name : targets.length;
}
