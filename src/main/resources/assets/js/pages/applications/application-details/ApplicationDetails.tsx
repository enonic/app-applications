import type { Application, ApplicationInfoEntry } from '../../../entities/application';
import { useI18n } from '../../../shared/i18n';
import { DetailsPanel } from '../../../widgets/details-panel/DetailsPanel';
import { ApplicationDetailsHeader } from './ApplicationDetailsHeader';
import { ApplicationExtensionsSection } from './ApplicationExtensionsSection';
import { ApplicationIdProviderSection } from './ApplicationIdProviderSection';
import { ApplicationSchemaSection } from './ApplicationSchemaSection';
import { ApplicationSummarySection } from './ApplicationSummarySection';
import { ApplicationTasksSection } from './ApplicationTasksSection';
import { ApplicationWebAppSection } from './ApplicationWebAppSection';

export type ApplicationDetailsProps = {
  application: Application;
  info: ApplicationInfoEntry;
};

export function ApplicationDetails({ application, info }: ApplicationDetailsProps) {
  const infoErrorMessage = useI18n('applications.details.infoError');
  const { status, info: provided } = info;

  return (
    <DetailsPanel>
      <ApplicationDetailsHeader application={application} />
      <ApplicationSummarySection application={application} />

      {status === 'loading' && <DetailsPanel.Skeleton />}
      {status === 'error' && <p className="text-error text-sm">{infoErrorMessage}</p>}
      {status === 'ready' && (
        <>
          <ApplicationSchemaSection info={provided} />
          <ApplicationTasksSection info={provided} />
          <ApplicationExtensionsSection info={provided} />
          <ApplicationWebAppSection info={provided} />
          <ApplicationIdProviderSection info={provided} />
        </>
      )}
    </DetailsPanel>
  );
}
