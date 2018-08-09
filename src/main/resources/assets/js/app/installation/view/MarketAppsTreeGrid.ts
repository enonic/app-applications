import {MarketAppViewer} from './MarketAppViewer';
import {MarketApplication, MarketApplicationBuilder, MarketAppStatus, MarketAppStatusFormatter} from '../../market/MarketApplication';
import {MarketApplicationsFetcher} from '../../resource/MarketApplicationFetcher';
import {MarketApplicationResponse} from '../../resource/MarketApplicationResponse';
import {InstallUrlApplicationRequest} from '../../resource/InstallUrlApplicationRequest';
import {ApplicationInstallResult} from '../../resource/ApplicationInstallResult';
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
import i18n = api.util.i18n;

declare var CONFIG;

export class MarketAppsTreeGrid extends TreeGrid<MarketApplication> {

    static MAX_FETCH_SIZE: number = 20;

    private installApplications: Application[];

    public static debug: boolean = false;

    private gridDataLoaded: boolean;

    private nodesFilter: (nodes: TreeNode<MarketApplication>[]) => TreeNode<MarketApplication>[];

    constructor() {

        const nameColumn = new GridColumnBuilder<TreeNode<MarketApplication>>()
            .setName('Name')
            .setId('displayName')
            .setField('displayName')
            .setCssClass('app-name-and-icon')
            .setMinWidth(170)
            .setFormatter(MarketAppsTreeGrid.nameFormatter)
            .build();
        const versionColumn = new GridColumnBuilder<TreeNode<MarketApplication>>()
            .setName('Version')
            .setId('version')
            .setField('latestVersion')
            .setCssClass('version')
            .setMinWidth(40)
            .build();
        const appStatusColumns = new GridColumnBuilder<TreeNode<MarketApplication>>()
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

        this.installApplications = [];
        this.gridDataLoaded = false;

        this.subscribeAndManageClick();
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
        const firstLoadListener = () => {
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
                const nodeToUpdate = this.getRoot().getCurrentRoot().findNode(event.getApplicationKey().toString());
                if (!!nodeToUpdate) {
                    (<MarketApplication>nodeToUpdate.getData()).setStatus(MarketAppStatus.NOT_INSTALLED);
                    this.refresh();
                }
            }
        });
    }

    private findNodeByAppUrl(url: string): TreeNode<MarketApplication> {
        const nodes: TreeNode<MarketApplication>[] = this.getGrid().getDataView().getItems();
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
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

                    const app = <MarketApplication>nodeToUpdate.getData();
                    app.setProgress(event.getProgress());

                    const row = this.getGrid().getDataView().getRowById(nodeToUpdate.getId());
                    if (row > -1) {
                        const cell = this.getGrid().getColumnIndex('appStatus');
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
                            if (!!application) {
                                const marketApplication: MarketApplication = <MarketApplication>nodeToUpdate.getData();

                                if (MarketApplicationsFetcher.installedAppCanBeUpdated(marketApplication, application)) {
                                    marketApplication.setStatus(MarketAppStatus.OLDER_VERSION_INSTALLED);
                                } else {
                                    marketApplication.setStatus(MarketAppStatus.INSTALLED);
                                }
                                const row = this.getGrid().getDataView().getRowById(nodeToUpdate.getId());
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

    private subscribeAndManageClick() {
        this.getGrid().subscribeOnClick((event, data) => {
            const isInstallClicked: boolean = event.target.classList.contains(MarketAppStatusFormatter.statusInstallCssClass) ||
                                              event.target.classList.contains(MarketAppStatusFormatter.statusUpdateCssClass);
            const isAppNameClicked = event.target.classList.contains('app-name');

            if (isInstallClicked) {
                this.handleInstallClicked(event, data);
            } else if (isAppNameClicked) {
                this.toggleFullDescriptionForClickedItem(event);
            }
        });
    }

    private handleInstallClicked(event: any, data: any) {
        const node = this.getItem(data.row);
        const app = <MarketApplication>node.getData();
        const url = app.getLatestVersionDownloadUrl();
        const elem = new Element(new ElementFromHelperBuilder().setHelper(new ElementHelper(event.target)));
        const status = app.getStatus();

        app.setStatus(MarketAppStatus.INSTALLING);

        const row = this.getGrid().getDataView().getRowById(node.getId());
        if (row > -1) {
            this.getGrid().updateCell(row, this.getGrid().getColumnIndex('appStatus'));
        }

        if (MarketAppsTreeGrid.debug) {
            console.debug('MarketAppsTreeGrid: starting install', url, elem);
        }

        new InstallUrlApplicationRequest(url).sendAndParse().then((result: ApplicationInstallResult) => {
            if (!result.getFailure()) {
                elem.removeClass(MarketAppStatusFormatter.statusInstallCssClass + ' ' + MarketAppStatusFormatter.statusUpdateCssClass);
                elem.addClass(MarketAppStatusFormatter.getStatusCssClass(MarketAppStatus.INSTALLED));
            } else {
                elem.setHtml(MarketAppStatusFormatter.formatStatus(status));
            }
        }).catch((reason: any) => {
            elem.setHtml(MarketAppStatusFormatter.formatStatus(status));
            api.DefaultErrorHandler.handle(reason);
        });
    }

    private toggleFullDescriptionForClickedItem(event: any) {
        let rowElem = event.target;
        while (!rowElem.classList.contains('slick-row')) {
            rowElem = rowElem.parentElement;
        }

        const currentRowHeight: number = rowElem.children[0].offsetHeight;
        rowElem.classList.toggle('maximized');
        const newRowHeight: number = rowElem.children[0].offsetHeight;
        const diff: number = newRowHeight - currentRowHeight;

        // updating grid's height to fit new row's height
        rowElem.parentElement.style.height = (+rowElem.parentElement.style.height.replace('px', '') + diff) + 'px';

        // updating row's siblings to shift ahead with respect to new row's height
        while (rowElem.nextSibling) {
            rowElem = rowElem.nextSibling;
            rowElem.style.top = (+rowElem.style.top.replace('px', '') + diff) + 'px';
        }
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
        const app = <MarketApplication>node.getData();
        const statusWrapper = new api.dom.AEl();

        if (!!app.getAppKey()) {

            const status = app.getStatus();
            const progress = app.getProgress();

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
        this.installApplications = installApplications;
    }

    fetchChildren(): wemQ.Promise<MarketApplication[]> {
        const root = this.getRoot().getCurrentRoot();
        const children = root.getChildren();
        let from = root.getChildren().length;
        if (from > 0 && !children[from - 1].getData().getAppKey()) {
            children.pop();
            from--;
        }

        if (this.getErrorPanel().isVisible()) {
            this.hideErrorPanel();
            this.mask();
        }

        return MarketApplicationsFetcher.fetchChildren(this.getVersion(), this.installApplications, from,
            MarketAppsTreeGrid.MAX_FETCH_SIZE).then(
            (data: MarketApplicationResponse) => {
                const meta = data.getMetadata();
                const applications = children.map((el) => {
                    return el.getData();
                }).slice(0, from).concat(data.getApplications());
                root.setMaxChildren(meta.getTotalHits());
                if (from + meta.getHits() < meta.getTotalHits()) {
                    const emptyApplication = new MarketApplicationBuilder().setLatestVersion('').build();
                    applications.push(emptyApplication);
                }
                return applications;
            }).catch((reason: any) => {
            const status500Message = i18n('market.error.500');
            const defaultErrorMessage = i18n('market.error.default');
            this.handleError(reason, reason.getStatusCode() === 500 ? status500Message : defaultErrorMessage);
            return [];
        });
    }

    initData(nodes: TreeNode<MarketApplication>[]) {
        const items = this.nodesFilter ? this.nodesFilter(nodes) : nodes;
        super.initData(items);
        this.getGrid().getCanvasNode().style.height = (70 * items.length + 'px');
        this.getGrid().resizeCanvas();
    }

    private getVersion(): string {
        const version: string = CONFIG.xpVersion;
        if (!version) {
            return '';
        }
        const parts = version.split('.');
        if (parts.length > 3) {
            parts.pop(); // remove '.snapshot'
            return parts.join('.');
        }
        return version;
    }

    getDataId(data: MarketApplication): string {
        return data.getAppKey() ? data.getAppKey().toString() : '';
    }

    setNodesFilter(filterFunc: (nodes: TreeNode<MarketApplication>[]) => TreeNode<MarketApplication>[]) {
        this.nodesFilter = filterFunc;
    }
}
