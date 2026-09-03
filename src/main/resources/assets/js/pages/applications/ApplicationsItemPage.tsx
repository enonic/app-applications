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

  /*
   * ! Three states, not two. The panel reads its application out of the list, so `loading` means the list
   * ! has not arrived — "select an item" there reads as a deep link that did nothing. A failed list says
   * ! so, and a key nothing answers to is an application that is gone, not an empty selection.
   */
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
