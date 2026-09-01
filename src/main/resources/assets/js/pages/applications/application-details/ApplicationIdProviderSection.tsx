import type { ApplicationInfo } from '../../../entities/application';
import { DetailsPanel } from '../../../widgets/details-panel/DetailsPanel';

export type ApplicationIdProviderSectionProps = {
  info?: ApplicationInfo;
};

export function ApplicationIdProviderSection({ info }: ApplicationIdProviderSectionProps) {
  const idProvider = info?.idProvider;

  if (idProvider == null || (idProvider.mode == null && idProvider.usedBy.length === 0)) {
    return null;
  }

  return (
    <DetailsPanel.Section labelKey="applications.details.idProviderApplications">
      <div className="@container">
        <div className="grid grid-cols-1 gap-6 @lg:grid-cols-2">
          {idProvider.mode != null && (
            <DetailsPanel.Subsection labelKey="applications.details.mode">
              <span className="text-xs">{idProvider.mode}</span>
            </DetailsPanel.Subsection>
          )}

          {idProvider.usedBy.length > 0 && (
            <DetailsPanel.Subsection labelKey="applications.details.usedBy">
              <div className="flex flex-col gap-1">
                {idProvider.usedBy.map(({ key, displayName }) => (
                  <span key={key} className="text-xs wrap-anywhere">
                    {displayName}
                  </span>
                ))}
              </div>
            </DetailsPanel.Subsection>
          )}
        </div>
      </div>
    </DetailsPanel.Section>
  );
}
