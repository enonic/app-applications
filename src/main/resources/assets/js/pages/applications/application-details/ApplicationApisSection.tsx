import type { ApplicationInfo } from '../../../entities/application';
import { DetailsPanel } from '../../../widgets/details-panel/DetailsPanel';
import { apiEntries } from '../model/application-apis';

export type ApplicationApisSectionProps = {
  info?: ApplicationInfo;
  'data-component'?: string;
};

const APPLICATION_APIS_SECTION_NAME = 'ApplicationApisSection';

export function ApplicationApisSection({
  info,
  'data-component': componentName = APPLICATION_APIS_SECTION_NAME,
}: ApplicationApisSectionProps) {
  const apis = apiEntries(info);

  if (apis.length === 0) {
    return null;
  }

  return (
    <DetailsPanel.Section data-component={componentName} labelKey="applications.details.apis">
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

ApplicationApisSection.displayName = APPLICATION_APIS_SECTION_NAME;
