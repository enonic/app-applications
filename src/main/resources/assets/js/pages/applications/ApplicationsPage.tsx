import { useStore } from '@nanostores/preact';
import { LoaderCircle } from 'lucide-react';
import { useMemo } from 'preact/hooks';

import {
  $applications,
  $applicationUploads,
  ApplicationIcon,
  ApplicationVersions,
  loadApplications,
} from '../../entities/application';
import { loadMarketApplications, useMarketApplications } from '../../entities/market';
import { ConfirmMajorUpdateDialog } from '../../features/install-applications/ui/ConfirmMajorUpdateDialog';
import { InstallApplicationsDialog } from '../../features/install-applications/ui/InstallApplicationsDialog';
import { UninstallApplicationsDialog } from '../../features/uninstall-applications/ui/UninstallApplicationsDialog';
import { isManagedMode } from '../../shared/config';
import { i18n, useI18n } from '../../shared/i18n';
import { closeItem, openItem, useActiveKey } from '../../shared/routing';
import { ProgressBar } from '../../shared/ui/ProgressBar';
import { sortByDisplayName, type SortDirection } from '../../widgets/browse-list/browse-sort';
import { BrowseFilter } from '../../widgets/browse-list/BrowseFilter';
import { BrowseSort } from '../../widgets/browse-list/BrowseSort';
import { BrowseScreen } from '../../widgets/browse-screen/BrowseScreen';
import { useBrowseSection } from '../../widgets/browse-screen/useBrowseSection';
import { ManagedModeBanner } from '../../widgets/browse-toolbar/ManagedModeBanner';
import { ApplicationsItemPage } from './ApplicationsItemPage';
import { APPLICATION_ACTIONS } from './model/applications.actions';
import {
  filterApplicationsBySystem,
  searchApplications,
  systemEntry,
} from './model/applications.filter';
import {
  applicationStateLabelKey,
  availableVersions,
  toApplicationRow,
  toUploadRow,
} from './model/applications.rows';
import { applicationsFilter } from './model/filter.store';
import { applicationsSearch } from './model/search.store';
import { applicationsSelection } from './model/selection.store';
import { $applicationsSort, setApplicationsSort } from './model/sort.store';
import { useApplicationsScreen } from './model/useApplicationsScreen';

export function ApplicationsPage() {
  useApplicationsScreen();
  const { status, items } = useStore($applications);
  const query = useStore(applicationsSearch.$query);
  const selectedEntries = useStore(applicationsFilter.$selected);
  const sort = useStore($applicationsSort);
  const activeKey = useActiveKey();
  const managedMode = isManagedMode();
  const { items: marketItems } = useMarketApplications();
  const uploads = useStore($applicationUploads);

  const emptyLabel = useI18n('applications.list.empty');
  const uploadingLabel = useI18n('applications.list.uploading');
  const systemLabel = useI18n('applications.filter.system');
  const sortAscLabel = useI18n('applications.sort.nameAsc');
  const sortDescLabel = useI18n('applications.sort.nameDesc');
  const managedTitle = useI18n('applications.managed.title');
  const managedHelp = useI18n('applications.managed.help');

  const sortOptions = useMemo(
    () => [
      { id: 'asc', label: sortAscLabel },
      { id: 'desc', label: sortDescLabel },
    ],
    [],
  ) satisfies readonly { id: SortDirection; label: string }[];

  // The whole list is loaded, so the search narrows it here rather than on the server. Shared with
  // the entry's count below, so the query runs once per render rather than twice.
  const searched = useMemo(() => searchApplications(items, query), [items, query]);

  // Narrow first, order last: sorting only what survived is the cheaper half, and the order the rows
  // appear in has to be the final word.
  const visible = useMemo(
    () => sortByDisplayName(filterApplicationsBySystem(searched, selectedEntries), sort),
    [searched, selectedEntries, sort],
  );

  // The count follows the query but not the tick, so it answers "how many would this reveal".
  const entries = useMemo(() => [systemEntry(searched, systemLabel)], [searched]);

  // Empty while the market is loading or unreachable, which leaves every row on its installed
  // version alone — the list never waits on an outbound call.
  const available = useMemo(() => availableVersions(marketItems), [marketItems]);

  // Above the list and outside the query: a jar on its way up is not an application yet, so there is
  // nothing to search or sort it by. The spinner sits where an application's icon would, which is
  // what keeps the file name aligned with the names below it.
  const uploadRows = useMemo(
    () =>
      Object.entries(uploads).map(([id, { fileName, percent }]) =>
        toUploadRow(
          id,
          fileName,
          <LoaderCircle size={24} strokeWidth={1.5} className="animate-spin" aria-hidden />,
          <ProgressBar progress={percent ?? 0} label={uploadingLabel} className="w-34" />,
        ),
      ),
    [uploads, uploadingLabel],
  );

  const section = useBrowseSection({
    activeKey,
    openItem,
    closeItem,
    items,
    status,
    selection: applicationsSelection,
    search: applicationsSearch,
    resetOnLeave: [applicationsFilter],
    visible,
    // A fresh icon element per row: Preact writes into a vnode as it renders it.
    toRow: (application) =>
      toApplicationRow(
        application,
        <ApplicationIcon
          icon={application.icon}
          system={application.system}
          local={application.local}
        />,
        i18n(applicationStateLabelKey(application.state)),
        application.version == null ? undefined : (
          <ApplicationVersions
            installed={application.version}
            updateAvailable={available.has(application.key)}
          />
        ),
      ),
    leadingRows: uploadRows,
    reload: () => {
      void loadApplications();

      if (!managedMode) {
        void loadMarketApplications();
      }
    },
  });

  /*
   * ! `details` is one element rather than the host's `<Outlet />`: the shell owns the url, so the
   * ! panel reads the active row from `shared/routing` instead of from a child route. Everything else
   * ! is the host's screen.
   */
  return (
    <>
      <BrowseScreen
        {...section}
        actions={APPLICATION_ACTIONS}
        managedMode={managedMode}
        notice={<ManagedModeBanner title={managedTitle} help={managedHelp} />}
        emptyLabel={emptyLabel}
        details={<ApplicationsItemPage />}
        filter={
          <BrowseFilter
            entries={entries}
            selected={selectedEntries}
            onToggle={(id) => applicationsFilter.toggle(id)}
          />
        }
        sort={<BrowseSort options={sortOptions} value={sort} onChange={setApplicationsSort} />}
      />

      {/* Mounted whether or not they are open — each is its own store's subscriber, and the details
          panel reads install progress through the install dialog. Managed mode mounts none of them. */}
      {!managedMode && (
        <>
          <InstallApplicationsDialog />
          <UninstallApplicationsDialog />
          <ConfirmMajorUpdateDialog />
        </>
      )}
    </>
  );
}
