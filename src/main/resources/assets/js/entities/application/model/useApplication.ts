import { useStore } from '@nanostores/preact';

import type { Application } from './application.types';
import { $applications, type ApplicationsState } from './applications.store';

export type ApplicationLookup = {
  /** The list's status: the application is read out of it rather than fetched by key. */
  status: ApplicationsState['status'];
  /** Absent while the list loads, and after it loaded without an application under this key. */
  application?: Application;
};

/**
 * The application a details panel is on. Unlike Users, the list holds every application, so the
 * panel never fetches by key — a missing application means the key is gone, not that it is on its
 * way.
 */
export function useApplication(key: string | undefined): ApplicationLookup {
  const { status, items } = useStore($applications);

  return {
    status,
    application: key == null ? undefined : items.find((item) => item.key === key),
  };
}
