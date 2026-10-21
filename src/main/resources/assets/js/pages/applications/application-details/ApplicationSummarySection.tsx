import { Link } from '@enonic/ui';

import type { Application } from '../../../entities/application';
import { useI18n } from '../../../shared/i18n';
import { DetailsPanel } from '../../../widgets/details-panel/DetailsPanel';
import { systemVersionRequirement } from '../model/application-details';
import { ApplicationUpdateField } from './ApplicationUpdateField';

export type ApplicationSummarySectionProps = {
  application: Application;
  'data-component'?: string;
};

const APPLICATION_SUMMARY_SECTION_NAME = 'ApplicationSummarySection';

export function ApplicationSummarySection({
  application,
  'data-component': componentName = APPLICATION_SUMMARY_SECTION_NAME,
}: ApplicationSummarySectionProps) {
  const { key, description, version, systemVersion, vendorName, vendorUrl } = application;

  const vendorLinkLabel = useI18n('applications.details.vendorLink');
  const systemRequired = systemVersionRequirement(systemVersion);

  return (
    <DetailsPanel.Section
      data-component={componentName}
      labelKey="applications.details.application"
    >
      {description !== undefined && (
        <DetailsPanel.Field labelKey="applications.details.info">{description}</DetailsPanel.Field>
      )}

      {version !== undefined && (
        <DetailsPanel.Field labelKey="applications.details.version">{version}</DetailsPanel.Field>
      )}

      <ApplicationUpdateField application={application} />

      <DetailsPanel.Field labelKey="applications.details.key">{key}</DetailsPanel.Field>

      {vendorName !== undefined && (
        <DetailsPanel.Field labelKey="applications.details.vendor">
          {vendorUrl === undefined ? (
            vendorName
          ) : (
            <span className="inline-flex items-center gap-1">
              {vendorName}
              <Link href={vendorUrl} newTab rightIcon aria-label={vendorLinkLabel} />
            </span>
          )}
        </DetailsPanel.Field>
      )}

      {systemRequired !== undefined && (
        <DetailsPanel.Field labelKey="applications.details.systemRequired">
          {systemRequired}
        </DetailsPanel.Field>
      )}
    </DetailsPanel.Section>
  );
}

ApplicationSummarySection.displayName = APPLICATION_SUMMARY_SECTION_NAME;
