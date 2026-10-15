import type { Application, ApplicationInfoEntry } from '../../../entities/application';
import { useI18n } from '../../../shared/i18n';
import { DetailsPanel } from '../../../widgets/details-panel/DetailsPanel';
import { ApplicationAdminSection } from './ApplicationAdminSection';
import { ApplicationApisSection } from './ApplicationApisSection';
import { ApplicationDetailsHeader } from './ApplicationDetailsHeader';
import { ApplicationIdProviderSection } from './ApplicationIdProviderSection';
import { ApplicationSchemaSection } from './ApplicationSchemaSection';
import { ApplicationSummarySection } from './ApplicationSummarySection';
import { ApplicationTasksSection } from './ApplicationTasksSection';
import { ApplicationWebAppSection } from './ApplicationWebAppSection';

export type ApplicationDetailsProps = {
  application: Application;
  info: ApplicationInfoEntry;
  'data-component'?: string;
};

const APPLICATION_DETAILS_NAME = 'ApplicationDetails';

export function ApplicationDetails({
  application,
  info,
  'data-component': componentName = APPLICATION_DETAILS_NAME,
}: ApplicationDetailsProps) {
  const infoErrorMessage = useI18n('applications.details.infoError');
  const { status, info: provided } = info;

  return (
    <DetailsPanel data-component={componentName}>
      <ApplicationDetailsHeader application={application} />
      <ApplicationSummarySection application={application} />

      {status === 'loading' && <DetailsPanel.Skeleton />}
      {status === 'error' && <p className="text-error text-sm">{infoErrorMessage}</p>}
      {status === 'ready' && (
        <>
          <ApplicationSchemaSection info={provided} />
          <ApplicationTasksSection info={provided} />
          <ApplicationAdminSection info={provided} />
          <ApplicationApisSection info={provided} />
          <ApplicationWebAppSection info={provided} />
          <ApplicationIdProviderSection info={provided} />
        </>
      )}
    </DetailsPanel>
  );
}

ApplicationDetails.displayName = APPLICATION_DETAILS_NAME;
