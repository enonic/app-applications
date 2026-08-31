import type { ReactNode } from 'react';

import type { Application, ApplicationState } from '../../../entities/application';
import type { MarketApplication } from '../../../entities/market';
import type { BrowseRow } from '../../../widgets/browse-list/browse-list';

const STATE_LABEL_KEYS: Record<ApplicationState, string> = {
  STARTED: 'applications.state.started',
  STOPPED: 'applications.state.stopped',
};

export function applicationStateLabelKey(state: ApplicationState): string {
  return STATE_LABEL_KEYS[state];
}

/** The newer version the market offers, per application key. */
export function availableVersions(market: readonly MarketApplication[]): Map<string, string> {
  const available = new Map<string, string>();

  for (const application of market) {
    if (application.updateAvailable) {
      available.set(application.key, application.latest.version);
    }
  }

  return available;
}

/**
 * A jar on its way to the server, as a row. Named by the file, because the application inside it has
 * no name until core has read it — and `disabled`, because it is not an application yet: nothing can
 * open it, tick it or act on it.
 */
export function toUploadRow(
  id: string,
  fileName: string,
  icon: ReactNode,
  progress: ReactNode,
): BrowseRow {
  return { key: id, title: fileName, icon, meta: [progress], disabled: true };
}

export function toApplicationRow(
  application: Application,
  icon?: ReactNode,
  stateLabel?: string,
  version?: ReactNode,
): BrowseRow {
  // An application XP ships cannot be stopped, so its state is a constant.
  const meta = [version, application.system ? '' : stateLabel].filter((cell) => cell !== undefined);

  return {
    key: application.key,
    title: application.displayName,
    subtitle: application.description,
    icon,
    meta: meta.length === 0 ? undefined : meta,
    dimmed: application.state === 'STOPPED',
    // An application XP ships is not the operator's to act on, so its row opens and navigates like any
    // other but cannot be ticked.
    selectable: !application.system,
  };
}
