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
  /** What the application provides, absent until the first render has asked for it. */
  info?: ApplicationInfoEntry;
};

export function ApplicationDetails({ application, info }: ApplicationDetailsProps) {
  const infoErrorMessage = useI18n('applications.details.infoError');
  // ! One request, so one message. Every section below is fed by the same `applicationInfo`, and
  // ! letting each report the failure itself printed it once per section.
  const provided = info?.status === 'ready' ? info.info : undefined;

  return (
    <DetailsPanel>
      <ApplicationDetailsHeader application={application} />
      <ApplicationSummarySection application={application} />

      {info?.status === 'error' && <p className="text-error text-sm">{infoErrorMessage}</p>}

      <ApplicationSchemaSection info={provided} />
      <ApplicationTasksSection info={provided} />
      <ApplicationExtensionsSection info={provided} />
      <ApplicationWebAppSection info={provided} />
      <ApplicationIdProviderSection info={provided} />
    </DetailsPanel>
  );
}
