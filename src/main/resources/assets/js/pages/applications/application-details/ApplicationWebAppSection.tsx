import { Link } from '@enonic/ui';

import type { ApplicationInfo } from '../../../entities/application';
import { hasVirtualHosts } from '../../../shared/config';
import { DetailsPanel } from '../../../widgets/details-panel/DetailsPanel';

export type ApplicationWebAppSectionProps = {
  info?: ApplicationInfo;
  'data-component'?: string;
};

const APPLICATION_WEB_APP_SECTION_NAME = 'ApplicationWebAppSection';

export function ApplicationWebAppSection({
  info,
  'data-component': componentName = APPLICATION_WEB_APP_SECTION_NAME,
}: ApplicationWebAppSectionProps) {
  const deploymentPath = info?.deploymentPath;

  if (deploymentPath == null || deploymentPath.length === 0) {
    return null;
  }

  // ? An internal path, not a url: it resolves against the page the section is mounted to, which
  // reaches the webapp only where no virtual host mapping stands between the two.
  const linkable = !hasVirtualHosts();

  return (
    <DetailsPanel.Section data-component={componentName} labelKey="applications.details.webApp">
      <DetailsPanel.Subsection labelKey="applications.details.internalPath">
        <div className="flex flex-col items-start gap-1">
          {linkable ? (
            <Link href={deploymentPath} newTab className="text-xs wrap-anywhere">
              {deploymentPath}
            </Link>
          ) : (
            <span className="text-xs wrap-anywhere">{deploymentPath}</span>
          )}
        </div>
      </DetailsPanel.Subsection>
    </DetailsPanel.Section>
  );
}

ApplicationWebAppSection.displayName = APPLICATION_WEB_APP_SECTION_NAME;
