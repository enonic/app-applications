import { Tooltip } from '@enonic/ui';
import { useStore } from '@nanostores/preact';

import type { Application } from '../../../entities/application';
import { useMarketApplication } from '../../../entities/market';
import { $marketInstalls, startMarketUpdate } from '../../../features/install-applications';
import { isManagedMode } from '../../../shared/config';
import { formatDate } from '../../../shared/format';
import { i18n, useI18n } from '../../../shared/i18n';
import { ProgressButton } from '../../../shared/ui/ProgressButton';
import { DetailsPanel } from '../../../widgets/details-panel/DetailsPanel';

export type ApplicationUpdateFieldProps = {
  application: Application;
};

const TOOLTIP_DELAY = 300;

/**
 * What the market offers over what is installed, with the update a press away — the install dialog
 * says the same thing, but only for someone who already suspected there was something to find.
 */
export function ApplicationUpdateField({ application }: ApplicationUpdateFieldProps) {
  const { marketApplication } = useMarketApplication(application.key);
  const installs = useStore($marketInstalls);

  const updateLabel = useI18n('applications.action.update');
  const localLabel = useI18n('applications.details.localNoUpdate');

  // Managed mode reads no catalogue.
  if (isManagedMode() || marketApplication?.updateAvailable !== true) {
    return null;
  }

  const { version, versionDate } = marketApplication.latest;
  // ? The progress events behind this reach the store through `InstallApplicationsDialog`, which the
  // ? page mounts whether or not it is open — the panel subscribes to nothing of its own.
  const install = installs[application.key];

  const button = (
    <ProgressButton
      variant="outline"
      label={updateLabel}
      size="sm"
      className="w-40"
      progress={install == null ? undefined : (install.percent ?? 0)}
      disabled={application.local}
      onClick={() => startMarketUpdate(marketApplication)}
    />
  );

  return (
    <DetailsPanel.Field labelKey="applications.details.updateAvailable">
      <span className="flex flex-col items-start gap-2.5">
        <span>
          {versionDate == null
            ? version
            : i18n('applications.details.updateVersion', version, formatDate(versionDate))}
        </span>

        {application.local ? (
          <Tooltip value={localLabel} side="top" delay={TOOLTIP_DELAY} asChild>
            <span className={`inline-flex w-40`}>{button}</span>
          </Tooltip>
        ) : (
          button
        )}
      </span>
    </DetailsPanel.Field>
  );
}
