import { Link } from '@enonic/ui';

import type { ApplicationInfo } from '../../../entities/application';
import { DetailsPanel } from '../../../widgets/details-panel/DetailsPanel';
import { extensionGroups } from '../model/application-extensions';

export type ApplicationExtensionsSectionProps = {
  info?: ApplicationInfo;
};

export function ApplicationExtensionsSection({ info }: ApplicationExtensionsSectionProps) {
  const groups = extensionGroups(info);

  if (groups.length === 0) {
    return null;
  }

  return (
    <DetailsPanel.Section labelKey="applications.details.extensions">
      <div className="@container">
        <div className="grid grid-cols-1 gap-6 @lg:grid-cols-2 @3xl:grid-cols-3">
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
