import { useEffect } from 'preact/hooks';

import { ensureApplications } from '../../../entities/application';
import { ensureMarketApplications } from '../../../entities/market';

export function useApplicationsScreen(): void {
  useEffect(() => {
    void ensureApplications();
    void ensureMarketApplications();
  }, []);
}
