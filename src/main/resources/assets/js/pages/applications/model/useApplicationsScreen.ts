import { useEffect } from 'preact/hooks';

import { ensureApplications } from '../../../entities/application';
import { ensureMarketApplications } from '../../../entities/market';
import { isManagedMode } from '../../../shared/config';

export function useApplicationsScreen(): void {
  useEffect(() => {
    void ensureApplications();

    // The one read that leaves the instance, and managed mode has nothing to install from it.
    if (!isManagedMode()) {
      void ensureMarketApplications();
    }
  }, []);
}
