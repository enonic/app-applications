import { Link, Tooltip } from '@enonic/ui';

import { type Application, ApplicationIcon } from '../../../entities/application';
import { useMarketApplication } from '../../../entities/market';
import { isManagedMode } from '../../../shared/config';
import { useI18n } from '../../../shared/i18n';
import { DetailsPanel } from '../../../widgets/details-panel/DetailsPanel';
import { ApplicationStateMenu } from './ApplicationStateMenu';

export type ApplicationDetailsHeaderProps = {
  application: Application;
};

const TOOLTIP_DELAY = 300;

export function ApplicationDetailsHeader({ application }: ApplicationDetailsHeaderProps) {
  // Absent for an application the market does not carry, and while the catalogue is still loading —
  // both mean no link rather than an empty one.
  const { marketApplication } = useMarketApplication(application.key);
  const marketLinkLabel = useI18n('applications.details.marketLink');

  // Managed mode shows no links out, and never reads the catalogue this one comes from.
  const pageUrl = isManagedMode() ? undefined : marketApplication?.pageUrl;

  return (
    <DetailsPanel.Header
      icon={
        <ApplicationIcon
          icon={application.icon}
          size="lg"
          system={application.system}
          local={application.local}
        />
      }
      title={application.displayName}
      titleAction={
        pageUrl != null && (
          <Tooltip value={marketLinkLabel} side="top" delay={TOOLTIP_DELAY} asChild>
            <Link
              href={pageUrl}
              newTab
              rightIcon
              aria-label={marketLinkLabel}
              className="focus-visible:ring-ring text-subtle visited:text-subtle focus-visible:text-subtle shrink-0 rounded-sm focus-visible:bg-transparent focus-visible:ring-2"
            />
          </Tooltip>
        )
      }
      action={<ApplicationStateMenu application={application} />}
    />
  );
}
