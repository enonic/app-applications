import {
  type ApplicationLookup,
  useApplication,
  useApplicationInfo,
} from '../../entities/application';
import { useItemId } from '../../shared/host';
import { DetailsPanel } from '../../widgets/details-panel/DetailsPanel';
import { ApplicationDetails } from './application-details/ApplicationDetails';

type ApplicationsItemPageProps = {
  'data-component'?: string;
};

const APPLICATIONS_ITEM_PAGE_NAME = 'ApplicationsItemPage';

export function ApplicationsItemPage({
  'data-component': componentName = APPLICATIONS_ITEM_PAGE_NAME,
}: ApplicationsItemPageProps) {
  const id = useItemId();
  const { status, application } = useApplication(id);
  const info = useApplicationInfo(id, application?.state);

  if (application == null) {
    return (
      <DetailsPanel.Empty data-component={componentName} labelKey={emptyLabelKey(status, id)} />
    );
  }

  return <ApplicationDetails application={application} info={info} />;
}

ApplicationsItemPage.displayName = APPLICATIONS_ITEM_PAGE_NAME;

function emptyLabelKey(status: ApplicationLookup['status'], key: string | undefined): string {
  if (status === 'loading') {
    return 'browse.details.loading';
  }
  if (status === 'error') {
    return 'applications.details.failed';
  }

  return key == null ? 'browse.details.empty' : 'applications.details.notFound';
}
