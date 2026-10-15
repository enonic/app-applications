import { Link } from '@enonic/ui';

import type { ApplicationInfo } from '../../../entities/application';
import { DetailsPanel } from '../../../widgets/details-panel/DetailsPanel';
import { adminGroups } from '../model/application-admin';

export type ApplicationAdminSectionProps = {
  info?: ApplicationInfo;
  'data-component'?: string;
};

const APPLICATION_ADMIN_SECTION_NAME = 'ApplicationAdminSection';

export function ApplicationAdminSection({
  info,
  'data-component': componentName = APPLICATION_ADMIN_SECTION_NAME,
}: ApplicationAdminSectionProps) {
  const groups = adminGroups(info);

  if (groups.length === 0) {
    return null;
  }

  return (
    <DetailsPanel.Section data-component={componentName} labelKey="applications.details.admin">
      <div className="@container">
        <div className="grid grid-cols-1 gap-6 @lg:grid-cols-2">
          {groups.map(({ labelKey, items }) => (
            <DetailsPanel.Subsection key={labelKey} labelKey={labelKey}>
              <div className="flex flex-col items-start gap-1">
                {items.map(({ key, label, url }) =>
                  url == null ? (
                    <span key={key} className="text-xs wrap-anywhere">
                      {label}
                    </span>
                  ) : (
                    <Link key={key} href={url} newTab className="text-xs wrap-anywhere">
                      {label}
                    </Link>
                  ),
                )}
              </div>
            </DetailsPanel.Subsection>
          ))}
        </div>
      </div>
    </DetailsPanel.Section>
  );
}

ApplicationAdminSection.displayName = APPLICATION_ADMIN_SECTION_NAME;
