import { Link } from '@enonic/ui';

import type { ApplicationInfo } from '../../../entities/application';
import { hasVirtualHosts } from '../../../shared/config';
import { DetailsPanel } from '../../../widgets/details-panel/DetailsPanel';

export type ApplicationWebAppSectionProps = {
  info?: ApplicationInfo;
};

export function ApplicationWebAppSection({ info }: ApplicationWebAppSectionProps) {
  const deploymentUrl = info?.deploymentUrl;

  if (deploymentUrl == null || deploymentUrl.length === 0) {
    return null;
  }

  // ? An internal path, not a url: it resolves against the page the section is mounted to, which
  // reaches the webapp only where no virtual host mapping stands between the two.
  const linkable = !hasVirtualHosts();

  return (
    <DetailsPanel.Section labelKey="applications.details.webApp">
      <DetailsPanel.Subsection labelKey="applications.details.deployment">
        <div className="flex flex-col items-start gap-1">
          {linkable ? (
            <Link href={deploymentUrl} newTab className="text-xs wrap-anywhere">
              {deploymentUrl}
            </Link>
          ) : (
            <span className="text-xs wrap-anywhere">{deploymentUrl}</span>
          )}
        </div>
      </DetailsPanel.Subsection>
    </DetailsPanel.Section>
  );
}
