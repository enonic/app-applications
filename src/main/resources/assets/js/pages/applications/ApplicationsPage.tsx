import { textOf } from '@enonic/ui-kit';
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
import { useHostFrame, useItemId } from '../../shared/host';
import { i18n, useI18n } from '../../shared/i18n';
import { ProgressBar } from '../../shared/ui/ProgressBar';
import {
  DEFAULT_SORT_DIRECTION,
  sortByDisplayName,
  type SortDirection,
} from '../../widgets/browse-list/browse-sort';
import { BrowseSort, type BrowseSortOption } from '../../widgets/browse-list/BrowseSort';
import { BrowseScreen } from '../../widgets/browse-screen/BrowseScreen';
import { useBrowseSection } from '../../widgets/browse-screen/useBrowseSection';
import { ManagedModeBanner } from '../../widgets/browse-toolbar/ManagedModeBanner';
import { ApplicationsItemPage } from './ApplicationsItemPage';
import { applicationActions } from './model/applications.actions';
import {
  applicationFields,
  filterApplications,
  searchApplications,
} from './model/applications.filter';
import {
  applicationStateLabelKey,
  availableVersions,
  toApplicationRow,
  toUploadRow,
} from './model/applications.rows';
import { applicationsFilter } from './model/filter.store';
import { applicationsSelection } from './model/selection.store';
import { $applicationsSort, setApplicationsSort } from './model/sort.store';
import { useApplicationsScreen } from './model/useApplicationsScreen';

const APPLICATIONS_PAGE_NAME = 'ApplicationsPage';

export function ApplicationsPage() {
  useApplicationsScreen();
  const { status, items } = useStore($applications);
  const query = useStore(applicationsFilter.$query);
  const sort = useStore($applicationsSort);
  const activeKey = useItemId();
  const { openItem, closeItem, notify } = useHostFrame();
  const managedMode = isManagedMode();
  const { status: marketStatus, items: marketItems } = useMarketApplications();
  const uploads = useStore($applicationUploads);

  const emptyLabel = useI18n('applications.list.empty');
  const uploadingLabel = useI18n('applications.list.uploading');
  const filterPlaceholder = useI18n('applications.filter.placeholder');
  const systemFieldLabel = useI18n('applications.filter.system');
  const stateFieldLabel = useI18n('applications.filter.state');
  const startedLabel = useI18n('applications.state.started');
  const stoppedLabel = useI18n('applications.state.stopped');
  const upgradeFieldLabel = useI18n('applications.filter.upgrade');
  const yesLabel = useI18n('applications.filter.yes');
  const noLabel = useI18n('applications.filter.no');
  const marketFailedLabel = useI18n('applications.filter.marketFailed');
  const sortNameLabel = useI18n('applications.sort.name');
  const sortAscLabel = useI18n('applications.sort.nameAsc');
  const sortDescLabel = useI18n('applications.sort.nameDesc');
  const managedTitle = useI18n('applications.managed.title');
  const managedHelp = useI18n('applications.managed.help');

  // The frame is one per mount, so the actions built over its `notify` are too.
  const actions = useMemo(() => applicationActions(notify), [notify]);

  const sortOptions = useMemo(
    () => [
      { id: 'asc', label: sortAscLabel, field: sortNameLabel, direction: 'asc' },
      { id: 'desc', label: sortDescLabel, field: sortNameLabel, direction: 'desc' },
    ],
    [],
  ) satisfies readonly BrowseSortOption<SortDirection>[];

  // Empty while the market is loading or unreachable, which leaves every row on its installed
  // version alone — the list never waits on an outbound call.
  const available = useMemo(() => availableVersions(marketItems), [marketItems]);

  // The whole list is loaded, so the text narrows it here rather than on the server. Shared with the
  // field counts below, so the text runs once per render rather than twice.
  const searched = useMemo(() => searchApplications(items, textOf(query)), [items, query]);

  // Narrow first, order last: sorting only what survived is the cheaper half, and the order the rows
  // appear in has to be the final word.
  const visible = useMemo(
    () => sortByDisplayName(filterApplications(searched, query, available), sort),
    [searched, query, available, sort],
  );

  const fields = useMemo(
    () =>
      applicationFields(
        searched,
        query,
        available,
        managedMode ? undefined : { status: marketStatus },
        {
          system: systemFieldLabel,
          state: stateFieldLabel,
          started: startedLabel,
          stopped: stoppedLabel,
          upgrade: upgradeFieldLabel,
          yes: yesLabel,
          no: noLabel,
          marketFailed: marketFailedLabel,
        },
      ),
    [
      searched,
      query,
      available,
      managedMode,
      marketStatus,
      systemFieldLabel,
      stateFieldLabel,
      startedLabel,
      stoppedLabel,
      upgradeFieldLabel,
      yesLabel,
      noLabel,
      marketFailedLabel,
    ],
  );

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
    filter: applicationsFilter,
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
   * ! `details` is one element rather than a router's `<Outlet />`: the shell owns the url, so the
   * ! panel reads the active row from this mount's frame instead of from a child route.
   *
   * ? A root element rather than a fragment: the host keeps every section mounted, so a test scopes
   * ? its selectors to this one by the name on it.
   */
  return (
    <div data-component={APPLICATIONS_PAGE_NAME} className="flex min-h-0 min-w-0 flex-1 flex-col">
      <BrowseScreen
        {...section}
        actions={actions}
        managedMode={managedMode}
        notice={<ManagedModeBanner title={managedTitle} help={managedHelp} />}
        emptyLabel={emptyLabel}
        filterPlaceholder={filterPlaceholder}
        fields={fields}
        details={<ApplicationsItemPage />}
        sort={
          <BrowseSort
            options={sortOptions}
            value={sort}
            onChange={setApplicationsSort}
            defaultValue={DEFAULT_SORT_DIRECTION}
          />
        }
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
    </div>
  );
}

ApplicationsPage.displayName = APPLICATIONS_PAGE_NAME;
