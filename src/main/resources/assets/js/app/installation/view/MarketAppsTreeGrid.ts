import {MarketAppViewer} from './MarketAppViewer';
import {MarketApplicationFetcher} from '../../resource/MarketApplicationFetcher';
import Element = api.dom.Element;
import ElementHelper = api.dom.ElementHelper;
import ElementFromHelperBuilder = api.dom.ElementFromHelperBuilder;
import GridColumnBuilder = api.ui.grid.GridColumnBuilder;
import TreeGrid = api.ui.treegrid.TreeGrid;
import TreeNode = api.ui.treegrid.TreeNode;
import TreeGridBuilder = api.ui.treegrid.TreeGridBuilder;
import Application = api.application.Application;
import ApplicationEvent = api.application.ApplicationEvent;
import ApplicationEventType = api.application.ApplicationEventType;
import MarketApplication = api.application.MarketApplication;
import MarketAppStatus = api.application.MarketAppStatus;
import MarketAppStatusFormatter = api.application.MarketAppStatusFormatter;
import MarketApplicationResponse = api.application.MarketApplicationResponse;
import MarketHelper = api.application.MarketHelper;
import InstallUrlApplicationRequest = api.application.InstallUrlApplicationRequest;
import ApplicationInstallResult = api.application.ApplicationInstallResult;
import i18n = api.util.i18n;

declare var CONFIG;

export class MarketAppsTreeGrid extends TreeGrid<MarketApplication> {

    private installedApplications: Application[];

    public static debug: boolean = false;

    private gridDataLoaded: boolean;

    private nodesFilter: (nodes: TreeNode<MarketApplication>[]) => TreeNode<MarketApplication>[];

    constructor() {

        let nameColumn = new GridColumnBuilder<TreeNode<MarketApplication>>()
            .setName('Name')
            .setId('displayName')
            .setField('displayName')
            .setCssClass('app-name-and-icon')
            .setMinWidth(170)
            .setFormatter(MarketAppsTreeGrid.nameFormatter)
            .build();
        let versionColumn = new GridColumnBuilder<TreeNode<MarketApplication>>()
            .setName('Version')
            .setId('version')
            .setField('latestVersion')
            .setCssClass('version')
            .setMinWidth(40)
            .build();
        let appStatusColumns = new GridColumnBuilder<TreeNode<MarketApplication>>()
            .setName('AppStatus')
            .setId('appStatus')
            .setField('status')
            .setCssClass('status')
            .setMinWidth(50)
            .setFormatter(MarketAppsTreeGrid.appStatusFormatter)
            .setCssClass('app-status').build();

        super(new TreeGridBuilder<MarketApplication>()
            .setColumns([
                nameColumn,
                versionColumn,
                appStatusColumns
            ])
            .setPartialLoadEnabled(true)
            .setLoadBufferSize(2)
            .setCheckableRows(false)
            .setShowToolbar(false)
            .setRowHeight(70)
            .disableMultipleSelection(true)
            .prependClasses('market-app-tree-grid')
            .setSelectedCellCssClass('selected-sort-row')
            .setQuietErrorHandling(true)
            .setAutoLoad(false)
        );

        this.installedApplications = [];
        this.gridDataLoaded = false;

        this.subscribeAndManageInstallClick();
        this.subscribeOnUninstallEvent();
        this.subscribeOnInstallEvent();

        this.onShown(() => {
            if (this.loading) {
                return;
            }

            this.reload().then(() => {
                this.getGrid().resizeCanvas();
            });
        });
    }

    doRender(): Q.Promise<boolean> {
        return super.doRender().then((rendered) => {
            this.initDataLoadListener();
            this.initAvailableSizeChangeListener();
            return rendered;
        });
    }

    private initDataLoadListener() {
        let firstLoadListener = () => {
            if (this.getGrid().getDataView().getLength() > 0) {
                this.unLoaded(firstLoadListener);
                setTimeout(() => {
                    if (!this.gridDataLoaded) {
                        this.gridDataLoaded = true;
                        this.refresh();// this helps to show default app icon if one provided in json fails to upload
                    }
                }, 500);
            }
        };

        this.onLoaded(firstLoadListener);
    }

    private initAvailableSizeChangeListener() {
        api.ui.responsive.ResponsiveManager.onAvailableSizeChanged(this, (item: api.ui.responsive.ResponsiveItem) => {
            this.getGrid().resizeCanvas();
        });
    }

    private subscribeOnUninstallEvent() { // set status of market app to NOT_INSTALLED if it was uninstalled
        api.application.ApplicationEvent.on((event: ApplicationEvent) => {
            if (ApplicationEventType.UNINSTALLED === event.getEventType()) {
                let nodeToUpdate = this.getRoot().getCurrentRoot().findNode(event.getApplicationKey().toString());
                if (!!nodeToUpdate) {
                    (<MarketApplication>nodeToUpdate.getData()).setStatus(MarketAppStatus.NOT_INSTALLED);
                    this.refresh();
                }
            }
        });
    }

    private findNodeByAppUrl(url: string): TreeNode<MarketApplication> {
        let nodes: TreeNode<MarketApplication>[] = this.getGrid().getDataView().getItems();
        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i];
            if (node.getData().getLatestVersionDownloadUrl() === url) {
                return node;
            }
        }
        return null;
    }

    private subscribeOnInstallEvent() { // update status of market app
        api.application.ApplicationEvent.on((event: ApplicationEvent) => {

            let nodeToUpdate;

            if (MarketAppsTreeGrid.debug) {
                console.debug('MarketAppsTreeGrid: app event', event.getEventType(), event.getProgress());
            }

            switch (event.getEventType()) {
            case ApplicationEventType.PROGRESS:

                //TODO: send appKey from backend instead of looking for it!
                nodeToUpdate = this.findNodeByAppUrl(event.getApplicationUrl());
                if (!!nodeToUpdate) {

                    if (MarketAppsTreeGrid.debug) {
                        console.debug('MarketAppsTreeGrid: progress', event.getApplicationUrl(), event.getProgress());
                    }

                    let app = <MarketApplication>nodeToUpdate.getData();
                    app.setProgress(event.getProgress());

                    let row = this.getGrid().getDataView().getRowById(nodeToUpdate.getId());
                    if (row > -1) {
                        let cell = this.getGrid().getColumnIndex('appStatus');
                        this.getGrid().updateCell(row, cell);
                    }
                }
                break;
            case ApplicationEventType.INSTALLED:

                nodeToUpdate = this.getRoot().getCurrentRoot().findNode(event.getApplicationKey().toString());
                if (!!nodeToUpdate) {

                    if (MarketAppsTreeGrid.debug) {
                        console.debug('MarketAppsTreeGrid: installed', event.getApplicationUrl(), event.getProgress());
                    }

                    const app = <MarketApplication>nodeToUpdate.getData();
                    app.setStatus(MarketAppStatus.INSTALLED);

                    new api.application.GetApplicationRequest(event.getApplicationKey(), true).sendAndParse()
                        .then((application: api.application.Application)=> {
                            if (application) {
                                const marketApplication: MarketApplication = <MarketApplication>nodeToUpdate.getData();

                                if (MarketHelper.installedAppCanBeUpdated(marketApplication, application)) {
                                    marketApplication.setStatus(MarketAppStatus.OLDER_VERSION_INSTALLED);
                                } else {
                                    marketApplication.setStatus(MarketAppStatus.INSTALLED);
                                }
                                let row = this.getGrid().getDataView().getRowById(nodeToUpdate.getId());
                                if (row > -1) {
                                    this.getGrid().updateRow(row);
                                }
                            }
                        });
                }
                break;
            }
        });
    }

    private subscribeAndManageInstallClick() {
        this.getGrid().subscribeOnClick((event, data) => {
            let node = this.getItem(data.row);
            let app = <MarketApplication>node.getData();
            let url = app.getLatestVersionDownloadUrl();
            let elem = new Element(new ElementFromHelperBuilder().setHelper(new ElementHelper(event.target)));
            let status = app.getStatus();

            if ((elem.hasClass(MarketAppStatusFormatter.statusInstallCssClass) ||
                 elem.hasClass(MarketAppStatusFormatter.statusUpdateCssClass))) {

                app.setStatus(MarketAppStatus.INSTALLING);

                let row = this.getGrid().getDataView().getRowById(node.getId());
                if (row > -1) {
                    this.getGrid().updateCell(row, this.getGrid().getColumnIndex('appStatus'));
                }

                if (MarketAppsTreeGrid.debug) {
                    console.debug('MarketAppsTreeGrid: starting install', url, elem);
                }

                new InstallUrlApplicationRequest(url)
                    .sendAndParse().then((result: ApplicationInstallResult) => {
                    // api.application.ApplicationEvent.un(progressHandler);
                    if (!result.getFailure()) {

                        elem.removeClass(MarketAppStatusFormatter.statusInstallCssClass + ' ' +
                                         MarketAppStatusFormatter.statusUpdateCssClass);
                        elem.addClass(MarketAppStatusFormatter.getStatusCssClass(MarketAppStatus.INSTALLED));

                    } else {
                        elem.setHtml(MarketAppStatusFormatter.formatStatus(status));
                    }

                }).catch((reason: any) => {
                    elem.setHtml(MarketAppStatusFormatter.formatStatus(status));
                    api.DefaultErrorHandler.handle(reason);
                });
            }
        });
    }

    public static nameFormatter(row: number, cell: number, value: any, columnDef: any, node: TreeNode<MarketApplication>) {
        const data = <MarketApplication>node.getData();

        if (data.getAppKey()) {
            let viewer: MarketAppViewer = <MarketAppViewer>node.getViewer('name');
            if (!viewer) {
                viewer = new MarketAppViewer();
                viewer.setObject(data, node.calcLevel() > 1);
                node.setViewer('name', viewer);
            }
            return viewer.toString();
        }

        return '';
    }

    isEmptyNode(node: TreeNode<MarketApplication>): boolean {
        const data = node.getData();
        return !data.getAppKey();
    }

    public static appStatusFormatter(row: number, cell: number, value: any, columnDef: any, node: TreeNode<MarketApplication>) {
        let app = <MarketApplication>node.getData();
        let statusWrapper = new api.dom.AEl();

        if (!!app.getAppKey()) {

            let status = app.getStatus();
            let progress = app.getProgress();

            statusWrapper.setHtml(MarketAppStatusFormatter.formatStatus(status, progress), false);
            statusWrapper.addClass(MarketAppStatusFormatter.getStatusCssClass(status));

            if (status !== MarketAppStatus.NOT_INSTALLED && status !== MarketAppStatus.OLDER_VERSION_INSTALLED) {
                statusWrapper.getEl().setTabIndex(-1);
            }
        }

        return statusWrapper.toString();
    }

    sortNodeChildren(node: TreeNode<MarketApplication>) {
        this.initData(this.getRoot().getCurrentRoot().treeToList());
    }

    updateInstallApplications(installApplications: api.application.Application[]) {
        this.installedApplications = installApplications;
    }

    fetchChildren(): wemQ.Promise<MarketApplication[]> {
        this.hideErrorPanelIfVisible();

        return MarketApplicationFetcher.fetchApps(CONFIG.xpVersion).then((data: MarketApplicationResponse) => {
            const loadedApps: MarketApplication[] = data.getApplications();
            this.updateAppsStatuses(loadedApps);
            loadedApps.sort(this.compareAppsByStatus);

            this.getRoot().getCurrentRoot().setMaxChildren(data.getMetadata().getTotalHits());

            return loadedApps;
        }).catch((reason: any) => {
            const status500Message = i18n('market.error.500');
            const defaultErrorMessage = i18n('market.error.default');
            this.handleError(reason, reason.getStatusCode() === 500 ? status500Message : defaultErrorMessage);
            return [];
        });
    }

    private hideErrorPanelIfVisible() {
        if (this.getErrorPanel().isVisible()) {
            this.hideErrorPanel();
            this.mask();
        }
    }

    private updateAppsStatuses(applications: MarketApplication[]) {
        applications.filter(app => !!app.getLatestVersion()).forEach(this.updateAppStatus.bind(this));
    }

    private updateAppStatus(marketApp: MarketApplication) {
        for (let i = 0; i < this.installedApplications.length; i++) {
            if (marketApp.getAppKey().equals(this.installedApplications[i].getApplicationKey())) {
                if (MarketHelper.installedAppCanBeUpdated(marketApp, this.installedApplications[i])) {
                    marketApp.setStatus(MarketAppStatus.OLDER_VERSION_INSTALLED);
                } else {
                    marketApp.setStatus(MarketAppStatus.INSTALLED);
                }
                break;
            }
        }
    }

    private compareAppsByStatus(app1: MarketApplication, app2: MarketApplication): number {
        if ((app1.getStatus() === MarketAppStatus.OLDER_VERSION_INSTALLED) &&
            (app2.getStatus() === MarketAppStatus.OLDER_VERSION_INSTALLED)) {
            return app1.getDisplayName().localeCompare(app2.getDisplayName());
        }

        if (app1.getStatus() === MarketAppStatus.OLDER_VERSION_INSTALLED) {
            return -1;
        }

        return 1;
    }

    initData(nodes: TreeNode<MarketApplication>[]) {
        const items = this.nodesFilter ? this.nodesFilter(nodes) : nodes;
        super.initData(items);
        this.getGrid().getCanvasNode().style.height = (70 * items.length + 'px');
        this.getGrid().resizeCanvas();
    }

    getDataId(data: MarketApplication): string {
        return data.getAppKey() ? data.getAppKey().toString() : '';
    }

    setNodesFilter(filterFunc: (nodes: TreeNode<MarketApplication>[]) => TreeNode<MarketApplication>[]) {
        this.nodesFilter = filterFunc;
    }
}
