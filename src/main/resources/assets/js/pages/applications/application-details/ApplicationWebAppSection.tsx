import { Link } from '@enonic/ui';

import type { ApplicationInfo } from '../../../entities/application';
import { DetailsPanel } from '../../../widgets/details-panel/DetailsPanel';

export type ApplicationWebAppSectionProps = {
  info?: ApplicationInfo;
};

export function ApplicationWebAppSection({ info }: ApplicationWebAppSectionProps) {
  const deploymentUrl = info?.deploymentUrl;

  if (deploymentUrl == null || deploymentUrl.length === 0) {
    return null;
  }

  return (
    <DetailsPanel.Section labelKey="applications.details.webApp">
      <DetailsPanel.Subsection labelKey="applications.details.deployment">
        <div className="flex flex-col items-start gap-1">
          <Link href={deploymentUrl} newTab className="text-xs wrap-anywhere">
            {deploymentUrl}
          </Link>
        </div>
      </DetailsPanel.Subsection>
    </DetailsPanel.Section>
  );
}
