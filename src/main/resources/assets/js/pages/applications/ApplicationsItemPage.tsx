import {
  type ApplicationLookup,
  useApplication,
  useApplicationInfo,
} from '../../entities/application';
import { useItemId } from '../../shared/host';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';
import { ApplicationDetails } from './application-details/ApplicationDetails';

export function ApplicationsItemPage() {
  const id = useItemId();
  const { status, application } = useApplication(id);
  const info = useApplicationInfo(id, application?.state);

  if (application == null) {
    return <DetailsPanel.Empty labelKey={emptyLabelKey(status, id)} />;
  }

  return <ApplicationDetails application={application} info={info} />;
}

function emptyLabelKey(status: ApplicationLookup['status'], key: string | undefined): string {
  if (status === 'loading') {
    return 'browse.details.loading';
  }
  if (status === 'error') {
    return 'applications.details.failed';
  }

  return key == null ? 'browse.details.empty' : 'applications.details.notFound';
}
