import type { ApplicationInfo } from '../../../entities/application';
import { DetailsPanel } from '../../../widgets/details-panel/DetailsPanel';
import { apiEntries } from '../model/application-apis';

export type ApplicationApisSectionProps = {
  info?: ApplicationInfo;
};

export function ApplicationApisSection({ info }: ApplicationApisSectionProps) {
  const apis = apiEntries(info);

  if (apis.length === 0) {
    return null;
  }

  return (
    <DetailsPanel.Section labelKey="applications.details.apis">
      <div className="flex flex-col items-start gap-1">
        {apis.map(({ key, label }) => (
          <span key={key} className="text-xs wrap-anywhere">
            {label}
          </span>
        ))}
      </div>
    </DetailsPanel.Section>
  );
}
